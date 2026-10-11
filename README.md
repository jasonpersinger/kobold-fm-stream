# 🗡️ Kobold.FM — Foundry VTT Audio Stream Module

Stream 24/7 underground dungeon synth, dark fantasy ambient, and tabletop soundtracks directly into your Foundry VTT sessions.

## Features
- **Integrated Sidebar Widget:** Injects a dedicated streaming control bar directly into Foundry's **Audio / Playlists** sidebar tab.
- **Synchronized Playback:** When the GM presses Play or Pause, playback syncs across all connected player clients in real time via Foundry sockets.
- **Live Metadata:** Displays live Now Playing artist and track titles polled directly from the Kobold.FM AzuraCast stream API.
- **Client Volume Control:** Individual players can adjust their local background listening volume.

## Compatibility
- **Foundry VTT:** v11 and v12
- **Audio Format:** 192kbps MP3 live broadcast stream

## Installation

### Method 1: Manual Folder Copy
1. Download or clone this directory as `kobold-fm-stream`.
2. Copy the `kobold-fm-stream` folder into your Foundry user data directory:
   - **Linux:** `~/.local/share/FoundryVTT/Data/modules/kobold-fm-stream`
   - **Windows:** `%localappdata%/FoundryVTT/Data/modules/kobold-fm-stream`
   - **macOS:** `~/Library/Application Support/FoundryVTT/Data/modules/kobold-fm-stream`
3. Launch Foundry VTT, go to your Game World, open **Manage Modules**, and enable **Kobold.FM**.

### Method 2: Manifest URL (One-Click Install)
In Foundry VTT Setup ➔ **Add-on Modules** ➔ **Install Module**:
Paste this into the **Manifest URL** field at the bottom:
```text
https://kobold.messy.quest/foundry/module.json
```
