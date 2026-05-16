# 🖥️ ThiliX's Retro PC

A retro-themed desktop environment built with React, simulating a fully interactive 80s/90s CRT computer — complete with draggable windows, a taskbar, desktop icons, and working apps. Customized and personalized by **ThiliX**.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **CRT Monitor Simulation** — Realistic CRT effects including scanlines, vignette, and phosphor glow
- **Draggable Windows** — Fully functional window management with minimize, close, and drag support
- **Taskbar** — Active app display with minimize/restore toggle, volume control, and system clock
- **Desktop Icons** — Clickable app shortcuts and social media links arranged on a configurable grid
- **Retro Sound Effects** — Synthesized boot, shutdown, click, and error sounds via the Web Audio API
- **Clippy Assistant** — An animated assistant that greets visitors with timed messages
- **Background Music** — Integrated YouTube player for ambient lofi beats
- **Responsive Scaling** — Automatically scales the CRT monitor to fit any screen size
- **Fully Configurable** — One config file (`userConfig.js`) controls all personal details, icons, and layout

## 🕹️ Built-in Apps

| App | Description |
|-----|-------------|
| **Terminal** | Retro command-line interface with commands like `help`, `about`, `ask`, and more |
| **me.txt** | A text viewer displaying personal bio and info |
| **My PC** | System specs viewer with config and setup tabs |
| **Netscape Browser** | Embedded iframe browser loading a configurable URL |
| **Internet Explorer** | Optional secondary browser window |
| **Paint** | A drawing canvas app |
| **DOOM** | Playable DOOM via js-dos emulation |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
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

Opens at `http://localhost:3000`. Click the **power button** on the monitor to turn on the desktop.

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 🛠️ Tech Stack

- **Framework** — React 18 (Create React App)
- **Styling** — Vanilla CSS with CSS custom properties
- **Audio** — Web Audio API for retro sound synthesis
- **Music** — `react-youtube` for background music playback
- **Game Emulation** — js-dos for running DOOM
- **SEO** — `react-helmet` for dynamic page metadata
- **Deployment** — `gh-pages` for GitHub Pages hosting

## 📁 Project Structure

```
Retro-Computer/
├── public/
│   ├── icons/              # App icons, wallpapers, social icons, assets
│   ├── doom.jsdos           # DOOM game bundle for js-dos
│   └── index.html           # HTML entry point
├── src/
│   ├── apps/                # Individual app modules
│   │   ├── AppCore.js       # Shared app lifecycle (open, close, minimize, drag)
│   │   ├── Terminal/        # Terminal emulator
│   │   ├── Txt/             # Text file viewer (me.txt)
│   │   ├── MyPc/            # PC specs viewer
│   │   ├── Browser/         # Netscape browser (iframe)
│   │   ├── InternetExplorer/# IE browser (iframe)
│   │   ├── Paint/           # Drawing canvas
│   │   └── Doom/            # DOOM via js-dos
│   ├── components/          # Shared UI components
│   │   ├── AppDisplay.*     # Window chrome (title bar, buttons, drag)
│   │   ├── TaskBarAppDisplay.* # Taskbar app entries
│   │   ├── IconDisplay.*    # Desktop shortcut icons
│   │   ├── Clock.*          # System tray clock
│   │   ├── Volume.*         # Volume toggle + YouTube player
│   │   ├── Clippy.*         # Clippy assistant
│   │   └── PopUp.*          # Modal popup windows
│   ├── context/             # React context providers
│   ├── userConfig.js        # ⭐ All personal configuration
│   ├── App.js               # Main app — CRT monitor, desktop, taskbar
│   └── App.css              # CRT styling, monitor, stand, case
└── package.json
```

## ⚙️ Customization

Everything is configured through **`src/userConfig.js`**:

| Section | What it controls |
|---------|-----------------|
| `name`, `tagline`, `age` | Your identity displayed across apps |
| `socials` | Desktop shortcut links (GitHub, Twitter, Spotify, Steam, LinkedIn, etc.) |
| `aboutMe` | Content shown in the me.txt app |
| `pcSpecs` / `peripherals` | Hardware specs in the My PC app |
| `terminalQA` | Q&A pairs for the terminal `ask` command |
| `clippyMessages` | Timed Clippy assistant messages |
| `browserUrl` | URL loaded in the Netscape browser |
| `musicVideoId` | YouTube video ID for background music |
| `wallpaper` | Desktop wallpaper (supports `.gif`, `.png`, `.jpg`) |
| `profilePicture` | Your profile picture |
| `iconPositions` | Desktop icon grid positions |

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <b>Thilix©</b> — Built with ☕ and nostalgia
</p>