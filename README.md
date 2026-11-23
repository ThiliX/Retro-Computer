# 🪟 ThiliX's Portfolio XP — an early-2000s desktop in the browser

An interactive portfolio built with React that boots like a 2001-era PC. There's a boot splash, a blue welcome screen with a user tile, then a full Luna-style desktop with draggable windows, a Start menu, a taskbar, tray balloons and the classic "Turn off computer" dialog that greys the screen.

🔗 **Live:** [thilix.github.io/Retro-Computer](https://thilix.github.io/Retro-Computer/)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Boot → log on → desktop:** a black boot splash with a sliding progress bar, the welcome screen (click your user name), then "welcome…" while the desktop loads.
- **Luna windows:** blue title bars, minimize / maximize / close buttons, active and inactive states, drag by the title bar, cascading placement.
- **Taskbar:** green Start button, one button per window (click to focus, minimize or restore), a system tray with a music toggle and a clock.
- **Start menu:** two columns with your picture and name, pinned and recent programs, an **All Programs** flyout, places, social links, Help and Run, plus **Log Off** and **Turn Off Computer**.
- **Power options:** Stand By, Turn Off and Restart, plus Log Off and Switch User (open windows survive a user switch). The desktop fades to grey behind the dialog.
- **Desktop icons:** select with a click, open with a double-click (or Enter), auto-arranged in columns. Social links show the shortcut arrow.
- **Tray balloons:** yellow notification tips after logging on.
- **Message boxes:** for Recycle Bin, My Documents, Help and Support.

### Sound
System sounds (startup, shutdown, log on, log off, error ding, notification, minimize/restore whoosh, the bin crumple and a navigation click) are **synthesized live with the Web Audio API**. They are original compositions in the spirit of the era, so the project ships no audio files.

### Artwork
- **Drawn for this project:** the logo, app icons (Notepad, Paint, Command Prompt, Synth-80, K.I.T.T.), power and dialog icons, as SVG in `public/icons/xp/`.
- **Original Windows XP assets:** the desktop icons (My Computer, My Documents, Recycle Bin), the Start button and the Bliss wallpaper. These belong to Microsoft and are included only as a non-commercial homage.

## 🕹️ Built-in Apps

| App | Description |
|-----|-------------|
| **My Computer** (System Properties) | General (about me), Hardware (Device Manager-style spec list) and Power (playful power schemes) tabs |
| **About Me.txt** (Notepad) | A short bio |
| **Command Prompt** | `help`, `ask`, `color`, `cls`, `exit` and ↑/↓ history |
| **Internet** | A web browser with a working address bar, back/forward, refresh and home |
| **Paint** | Pixel canvas with pencil, eraser, fill bucket, colour picker and the 28-colour palette |
| **Synth-80** | Polyphonic synthesizer with 4 waveforms, octave shift, reverb and keyboard input |
| **K.I.T.T.** | Red scanner with an AI that talks in character |

## 🚀 Getting Started

```bash
git clone https://github.com/ThiliX/Retro-Computer.git
cd Retro-Computer
npm install
npm start
```

Opens at `http://localhost:3000`. Double-click the boot screen to skip it.

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 🛠️ Tech Stack

- **Framework:** React 18 (Create React App)
- **Styling:** vanilla CSS with custom properties (the Luna palette in `src/App.css`)
- **Audio:** Web Audio API (`src/audio/xpAudio.js`) and the Synth-80 synthesizer
- **Music:** `react-youtube`
- **Deployment:** `gh-pages`

## 📁 Project Structure

```
Retro-Computer/
├── public/icons/xp/         # SVG icons and logo, plus the XP desktop icons and Start button
├── src/
│   ├── audio/xpAudio.js     # Synthesized system sounds
│   ├── apps/                # AppCore (window lifecycle) + each app
│   ├── components/          # Boot, welcome, taskbar, Start menu, dialogs, windows
│   ├── context/             # Window manager + desktop selection
│   ├── userConfig.js        # ⭐ All personal configuration
│   ├── App.js               # Phases (boot/login/desktop/shutdown), desktop, taskbar
│   └── App.css              # Luna theme tokens and shared controls
└── package.json
```

## ⚙️ Customization

Everything personal lives in **`src/userConfig.js`**:

| Section | What it controls |
|---------|-----------------|
| `name`, `tagline`, `age`, `pronouns`, `location` | Your identity across the desktop |
| `osOwner`, `osName`, `osEdition` | The "ThiliX Portfolio xp Developer Edition" wordmark |
| `socials` | Desktop shortcuts and Start menu links |
| `aboutMe` | Notepad text |
| `pcSpecs` / `peripherals` | System Properties tabs |
| `terminalQA` | Q&A for the `ask` command |
| `balloonTips` | Tray notifications after logging on |
| `browserUrl` | Home page of the Internet app |
| `musicVideoId` | YouTube video for background music |
| `wallpaper` | Desktop wallpaper (any image in `public/icons/`) |
| `profilePicture` | User tile and Start menu picture |

## 📄 License & Credits

This project is licensed under the **MIT License**. The look is a homage to early-2000s desktop design; it is not affiliated with or endorsed by Microsoft.

**Credits:** Built by extending and customizing the original [my-personal-computer](https://github.com/stefani16bit/my-personal-computer) repository by [stefani16bit](https://github.com/stefani16bit).
