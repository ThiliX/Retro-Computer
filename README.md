# Retro-Computer: A Visual Personal Resume

A retro-themed desktop environment built with React, designed as a dynamic, visual resume. This project showcases my professional journey as a "Computer" that has evolved over the years.

## ✨ Key Features

- **Retro 2000s Desktop UI**: A nostalgia-inducing interface with window management, a taskbar, and system tray.
- **3D/Sci-Fi Aesthetic**: A custom "High Energy" 3D loading animation, command-line interfaces, and terminal-style windows.
- **Dynamic Profiling**: The "computer" analyzes your personality and work style in real-time to adjust the interface, wallpaper, and "status effects" (e.g., focus, creativity, calm).
- **Modular Structure**: Built with **React** and **Vite**, featuring a modern build pipeline behind the retro facade.
- **Interactive "Core"**: You can click and drag the "Core" to move the entire desktop, simulating a physical system unit.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Retro-Computer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npm start
```

The application will open automatically in your browser, usually at `http://localhost:3000`.

## 🛠️ Technical Stack

- **Framework**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Styling**: SCSS/CSS Modules, CSS Custom Properties
- **Core Logic**: Custom hooks for state management and event handling

## 🏗️ Project Structure

```
Retro-Computer/
├── public/            # Static assets and preload scripts
├── src/
│   ├── assets/        # Images, fonts, sounds
│   ├── components/    # Reusable React components (windows, taskbar, etc.)
│   ├── core/          # Core application logic and state management
│   ├── styles/        # Global styles and themes
│   └── views/         # Different desktop views/modes
└── index.html       # Entry point
```

## 🎨 Customizing the "Computer"

This project is designed to be personalized. You can modify the following:

- **Backgrounds**: Edit `src/assets/backgrounds/` and update `SYSTEM.WALLPAPER` in `src/core/constants.js`.
- **Themes**: Adjust colors in `src/styles/themes.scss`.
- **Sounds**: Replace `.wav` files in `src/assets/sounds/`.

## 🤝 Contributing

Contributions are welcome! This is a personal project, but if you have ideas for features or improvements, feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License**.