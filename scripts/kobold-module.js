/**
 * Kobold.FM Foundry VTT Module
 * 24/7 Dungeon Synth & Fantasy Ambient Stream
 */

const KOBOLD_STREAM_URL = "https://kobold.messy.quest/listen/kobold.fm/radio.mp3";
const KOBOLD_API_URL = "https://kobold.messy.quest/api/nowplaying/kobold.fm";
const MODULE_ID = "kobold-fm-stream";

class KoboldRadioController {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.nowPlaying = { artist: "Loading...", title: "Kobold.FM" };
    this.pollInterval = null;
  }

  init() {
    this.audio = new Audio(KOBOLD_STREAM_URL);
    this.audio.crossOrigin = "anonymous";
    this.audio.volume = this.volume;

    // Listen for socket events from GM so party stays synchronized
    game.socket.on(`module.${MODULE_ID}`, (data) => {
      if (data.action === "play") {
        this.play(false);
      } else if (data.action === "pause") {
        this.pause(false);
      }
    });

    this.startMetadataPolling();
  }

  async fetchMetadata() {
    try {
      const res = await fetch(KOBOLD_API_URL);
      if (!res.ok) return;
      const data = await res.json();
      const song = data.now_playing?.song;
      if (song) {
        this.nowPlaying = {
          artist: song.artist || "Unknown",
          title: song.title || "Unknown",
          art: song.art || ""
        };
        this.updateUI();
      }
    } catch (e) {
      console.warn("Kobold.FM: Could not update track info", e);
    }
  }

  startMetadataPolling() {
    this.fetchMetadata();
    this.pollInterval = setInterval(() => this.fetchMetadata(), 25000);
  }

  play(broadcast = true) {
    if (!this.audio) return;
    // Re-set src to bust buffer lag and jump directly to live head
    this.audio.src = KOBOLD_STREAM_URL;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
      if (broadcast && game.user.isGM) {
        game.socket.emit(`module.${MODULE_ID}`, { action: "play" });
      }
    }).catch(err => console.error("Kobold.FM playback error:", err));
  }

  pause(broadcast = true) {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
    if (broadcast && game.user.isGM) {
      game.socket.emit(`module.${MODULE_ID}`, { action: "pause" });
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  updateUI() {
    const banner = document.getElementById("kobold-radio-banner");
    if (!banner) return;

    const playBtn = banner.querySelector(".kobold-toggle-btn");
    const trackSpan = banner.querySelector(".kobold-track-text");

    if (playBtn) {
      playBtn.innerHTML = this.isPlaying
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
      playBtn.setAttribute("title", this.isPlaying ? "Pause Kobold.FM" : "Play Kobold.FM");
    }

    if (trackSpan) {
      trackSpan.textContent = `${this.nowPlaying.artist} - ${this.nowPlaying.title}`;
    }
  }
}

const koboldController = new KoboldRadioController();

Hooks.once("init", () => {
  console.log("🕯️ Kobold.FM | Initializing 24/7 Dungeon Synth Audio Module");

  game.settings.register(MODULE_ID, "defaultVolume", {
    name: "Default Volume",
    hint: "Default streaming volume for Kobold.FM",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 1, step: 0.05 },
    default: 0.5,
    onChange: value => koboldController.setVolume(value)
  });
});

Hooks.once("ready", () => {
  koboldController.init();
  const savedVol = game.settings.get(MODULE_ID, "defaultVolume");
  koboldController.setVolume(savedVol);
});

// Inject Player Controls into Foundry VTT Playlists Directory Sidebar
Hooks.on("renderPlaylistDirectory", (app, html, data) => {
  if (html.find("#kobold-radio-banner").length > 0) return;

  const header = `
    <div id="kobold-radio-banner" class="kobold-bar">
      <div class="kobold-header">
        <span class="kobold-title"><i class="fas fa-broadcast-tower"></i> <strong>Kobold.FM</strong></span>
        <span class="kobold-live-dot" title="24/7 Live Stream">LIVE</span>
      </div>
      <div class="kobold-meta">
        <i class="fas fa-compact-disc ${koboldController.isPlaying ? 'fa-spin' : ''}"></i>
        <marquee scrollamount="3" class="kobold-track-text">${koboldController.nowPlaying.artist} - ${koboldController.nowPlaying.title}</marquee>
      </div>
      <div class="kobold-controls">
        <button type="button" class="kobold-toggle-btn">
          <i class="fas ${koboldController.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
        </button>
        <input type="range" class="kobold-vol-slider" min="0" max="1" step="0.05" value="${koboldController.volume}">
      </div>
    </div>
  `;

  html.find(".directory-header").after(header);

  html.find(".kobold-toggle-btn").on("click", (e) => {
    e.preventDefault();
    if (koboldController.isPlaying) {
      koboldController.pause(true);
    } else {
      koboldController.play(true);
    }
  });

  html.find(".kobold-vol-slider").on("input", (e) => {
    const val = parseFloat(e.target.value);
    koboldController.setVolume(val);
  });
});
