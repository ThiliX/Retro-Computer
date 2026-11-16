# 🎮 ThiliX's Battlestation — a modern gaming room running a 90s PC

An interactive 3D portfolio built with React and three.js. You step into a dark, RGB-lit gaming room at night, sit down at a modern gaming PC, and find it running **RetroBox**, an emulator for a fully working 90s operating system called *Sunset OS 98*. It has draggable windows, a terminal, Paint, a synthesizer and more.

**Present-day setup, 1997 soul.**

🔗 **Live:** [thilix.github.io/Retro-Computer](https://thilix.github.io/Retro-Computer/)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-r169-000000?logo=threedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### The room (3D)
- **Modern gaming setup:**
  - A widescreen monitor and a glass-side tower with spinning RGB fans.
  - An RGB keyboard, mouse, speakers, a headset stand and a gaming chair.
- **Lighting:**
  - Ceiling and desk LED strips, a neon name sign and hexagon light panels.
  - Bloom glow and a rainy night-city window.
- **Four RGB colour schemes** (sunset, ember, synthwave, dusk). Click the neon sign or the hex panels to cycle them.
- **Retro collectibles shelf.** The original beige 90s PC sits there as a display piece. Click it to switch to Classic mode.
- **Hover labels** name everything you can click.
- **Everything is procedural.** Every model and texture is generated in code, with no downloaded 3D assets.

### RetroBox (the screen)
- **Click the monitor to sit down.** The camera glides in, the PC powers on, and RetroBox boots the 90s machine: BIOS memory test, POST beep, floppy seek, then the desktop.
- **Modern host screen.** The 4:3 retro system runs in an emulator window on a 16:9 host desktop with a dock and clock.
- **Emulator controls:** 💾 **Disk**, **CRT** scanline filter on/off and ⟲ **Reset**.
- **Esc or Stand up** returns to the room. The desktop stays live on the monitor.

### Sunset OS 98 (the 90s system)
- Draggable windows, a taskbar, desktop icons and social links.
- CRT scanlines, vignette and a rolling refresh band.
- A Clippy-style assistant with timed messages, and background music via YouTube.

### Sound
- Generated live with the Web Audio API; there are no sound files.
- **The room:** modern PC power-on (soft click, fans spinning up, a ready chime) and a fan hum.
- **Inside RetroBox:** the 90s machine has a power switch, CRT warm-up, POST beep, floppy grind and hard-disk chatter.
- **Input:** mechanical key clicks while typing, and mouse clicks.
- **Distance:** sounds are muffled while you stand across the room and clear when you sit down.

### Classic mode
- A flat, front-on beige 90s PC with the same working desktop.
- It's used automatically when the browser has no WebGL, and you can switch to it anytime (top-right button or the shelf PC).

## 🕹️ Built-in Apps

| App | Description |
|-----|-------------|
| **Terminal** | Command line with `help`, `ask`, `color`, `cls`, `exit` and ↑/↓ history |
| **me.txt** | A text viewer with a short bio |
| **My PC** | About me, PC specs and peripherals |
| **Netscape Browser** | Embedded iframe browser loading a configurable URL |
| **Paint** | Pixel drawing canvas with pencil, eraser, fill bucket and colour picker |
| **Synth-80** | Polyphonic synthesizer with 4 waveforms, octave shift, reverb and keyboard input |
| **K.I.T.T.** | Red Larson scanner with an AI that talks in character |

## ⚡ Performance

The 3D room adapts to the machine it's running on:

- **High quality** (GPU available): soft shadows, bloom, every accent light, 60 fps in the room.
- **Low-power mode** starts automatically when hardware acceleration is off or the frame rate drops below 30 fps.
  - It turns off shadows, bloom and the costly accent lights, and renders at a lower resolution.
  - The room is redrawn at 24 fps.
  - A small notice suggests Classic mode.
- **When you're seated,** the 3D scene stops rendering entirely, because the screen covers it. The desktop is then shown with a flat 2D transform, which is cheap to draw and keeps text sharp.
- **three.js is loaded separately,** only when the 3D room is shown.

To preview a mode, add `?quality=low` or `?quality=high` to the URL.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation

```bash
git clone https://github.com/ThiliX/Retro-Computer.git
cd Retro-Computer
npm install
```

### Running Locally

```bash
npm start
```

Opens at `http://localhost:3000`. Click the monitor to sit down and boot the PC.

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 🛠️ Tech Stack

- **Framework:** React 18 (Create React App)
- **3D:** three.js, `@react-three/fiber` and `@react-three/postprocessing` (bloom, vignette)
- **Screen on the monitor:** CSS 3D transforms, using the same maths as three's CSS3DRenderer. The real React desktop stays interactive on the 3D monitor.
- **Styling:** vanilla CSS with custom properties (the Sunset Arcade palette)
- **Audio:** Web Audio API sound engine and the Synth-80 synthesizer
- **Music:** `react-youtube`
- **Deployment:** `gh-pages`

## 📁 Project Structure

```
Retro-Computer/
├── public/
│   ├── icons/               # App icons, wallpaper, social icons
│   └── index.html           # HTML entry point
├── src/
│   ├── world/               # 3D gaming room
│   │   ├── Room3D.js        # Canvas, quality modes, palettes, overlays
│   │   ├── GamingRoom.js    # Room, desk setup, RGB, shelf (procedural models)
│   │   ├── RetroBox.*       # Modern host screen + emulator window
│   │   ├── RetroPC.js       # Beige 90s PC model (shelf display piece)
│   │   ├── CameraRig.js     # Room view ↔ seated camera
│   │   ├── ScreenProjector.js # Pins the HTML screen onto the monitor
│   │   ├── FrameControl.js  # Frame throttling + frame-rate watcher
│   │   ├── quality.js       # Hardware-acceleration detection
│   │   └── textures.js      # Canvas-drawn textures (sky, neon, desk mat…)
│   ├── audio/               # Web Audio sound engine
│   ├── apps/                # Sunset OS apps
│   │   ├── AppCore.js       # Shared window lifecycle (open, close, minimize, drag)
│   │   ├── Terminal/  Txt/  MyPc/  Browser/  Paint/  Synth/  Kitt/
│   ├── components/          # Shared UI
│   │   ├── BootScreen.*     # BIOS POST boot sequence
│   │   ├── ClassicRig.js    # Flat 2D beige PC (Classic mode)
│   │   ├── WorldHud.*       # Stand up / power / view switch
│   │   ├── AppDisplay.*  TaskBarAppDisplay.*  IconDisplay.*
│   │   ├── Clock.*  Volume.*  Clippy.*  MobileDisclaimer.*
│   ├── context/             # Window manager context
│   ├── userConfig.js        # ⭐ All personal configuration
│   ├── App.js               # Power/boot state, desktop, view switching
│   └── App.css              # Theme tokens, CRT screen, Classic rig
└── package.json
```

## ⚙️ Customization

Personal details live in **`src/userConfig.js`**:

| Section | What it controls |
|---------|-----------------|
| `name`, `tagline`, `age`, `pronouns` | Your identity across apps |
| `copyright` | Footer text; also used for the neon sign, desk mat and host name |
| `socials` | Desktop shortcut links (GitHub, X, Spotify, Steam, LinkedIn, YouTube…) |
| `aboutMe` | Content of the me.txt app |
| `pcSpecs` / `peripherals` | My PC app |
| `terminalQA` | Q&A pairs for the terminal `ask` command |
| `clippyMessages` | Timed assistant messages |
| `browserUrl` | URL loaded in the Netscape browser |
| `musicVideoId` | YouTube video ID for background music |
| `wallpaper` | Sunset OS wallpaper (`.svg`, `.gif`, `.png`, `.jpg`) |
| `profilePicture` | Your profile picture |
| `iconPositions` | Desktop icon grid positions |

The RGB colour schemes are defined in `PALETTES` in `src/world/Room3D.js`.

## 📄 License & Credits

This project is licensed under the **MIT License**.

**Credits:** This project was built by extending and customizing the original [my-personal-computer](https://github.com/stefani16bit/my-personal-computer) repository created by [stefani16bit](https://github.com/stefani16bit).

---

<p align="center">
  <b>Thilix©</b> — Built with ☕, RGB and nostalgia
</p>
