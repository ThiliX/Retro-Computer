import React, { useEffect, useRef, useState } from "react";

import "./App.css";

import IconDisplay from "./components/IconDisplay";
import Clock from "./components/Clock";
import TaskBarAppDisplay from "./components/TaskBarAppDisplay";
import Volume from "./components/Volume";
import Clippy from "./components/Clippy";
import BootScreen from "./components/BootScreen";

import Terminal from "./apps/Terminal/Terminal";
import Txt from "./apps/Txt/Txt";
import MyPc from "./apps/MyPc/MyPc";
import Synth from "./apps/Synth/Synth";
import Paint from "./apps/Paint/Paint";
import Browser from "./apps/Browser/Browser";
import InternetExplorer from "./apps/InternetExplorer/InternetExplorer";
import Kitt from "./apps/Kitt/Kitt";

import { useAppsManager } from "./context/AppsManagerContext";
import { usePopUpsManager } from "./context/PopUpsManagerContext";
import userConfig from "./userConfig";

const DESKTOP_WIDTH = 800;
const DESKTOP_HEIGHT = 600;
const TASKBAR_HEIGHT = 38;

// Total footprint of monitor + stand + case, used to fit the whole PC in the viewport.
const RIG_WIDTH = 1040;
const RIG_HEIGHT = 1060;

// "off"     → black glass, waiting for the power button
// "booting" → BIOS POST screen
// "on"      → desktop
const POWER_OFF = "off";
const POWER_BOOTING = "booting";
const POWER_ON = "on";

// Social links, in the order they stack on the desktop.
const SOCIAL_ICONS = [
	{ key: "github", icon: "icons/github.png", title: "github" },
	{ key: "twitter", icon: "icons/x.png", title: "x" },
	{ key: "instagram", icon: "icons/instagram.png", title: "instagram" },
	{ key: "spotify", icon: "icons/spotify.png", title: "spotify" },
	{ key: "steam", icon: "icons/steam.png", title: "steam" },
	{ key: "linkedin", icon: "icons/linkedin.svg", title: "linkedin" },
	{ key: "youtube", icon: "icons/youtube.svg", title: "youtube" },
];

// ─── Retro sound effects (generated via Web Audio API) ───
let globalAudioCtx = null;
function getAudioCtx() {
	if (!globalAudioCtx) {
		globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}
	if (globalAudioCtx.state === "suspended") {
		globalAudioCtx.resume();
	}
	return globalAudioCtx;
}

function playTone(ctx, { type, from, to, start, duration, volume }) {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(from, ctx.currentTime + start);
	if (to) {
		osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + start + duration);
	}
	gain.gain.setValueAtTime(volume, ctx.currentTime + start);
	gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(ctx.currentTime + start);
	osc.stop(ctx.currentTime + start + duration);
}

function playRetroClick() {
	try {
		playTone(getAudioCtx(), { type: "sine", from: 800, to: 400, start: 0, duration: 0.08, volume: 0.15 });
	} catch (e) {
		/* silently fail */
	}
}

// Heavy power switch being pushed in: a high "click" then a low "clack".
function playPowerOnSound() {
	try {
		const ctx = getAudioCtx();
		playTone(ctx, { type: "square", from: 800, to: 100, start: 0, duration: 0.02, volume: 0.5 });
		playTone(ctx, { type: "triangle", from: 150, to: 30, start: 0.035, duration: 0.045, volume: 0.6 });
	} catch (e) {
		/* silently fail */
	}
}

// Switch released: heavy pull, then the snap back.
function playShutdownSound() {
	try {
		const ctx = getAudioCtx();
		playTone(ctx, { type: "triangle", from: 120, to: 20, start: 0, duration: 0.05, volume: 0.5 });
		playTone(ctx, { type: "square", from: 600, to: 80, start: 0.04, duration: 0.02, volume: 0.4 });
	} catch (e) {
		/* silently fail */
	}
}

// Short rising chiptune arpeggio once the desktop is up.
function playStartupChime() {
	try {
		const ctx = getAudioCtx();
		[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
			playTone(ctx, { type: "square", from: freq, start: i * 0.11, duration: 0.22, volume: 0.07 });
		});
		playTone(ctx, { type: "triangle", from: 261.63, start: 0, duration: 0.7, volume: 0.12 });
	} catch (e) {
		/* silently fail */
	}
}

function playErrorSound() {
	try {
		const ctx = getAudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "square";
		osc.frequency.setValueAtTime(200, ctx.currentTime);
		osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
		gain.gain.setValueAtTime(0.15, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.25);
	} catch (e) {
		/* silently fail */
	}
}

// Make sounds available globally for other components
window.retroSounds = { playRetroClick, playBootSound: playPowerOnSound, playShutdownSound, playErrorSound, playStartupChime };

function useFitToViewport() {
	useEffect(() => {
		function fit() {
			const scale = Math.min(window.innerWidth / RIG_WIDTH, window.innerHeight / RIG_HEIGHT);
			document.documentElement.style.setProperty("--rig-scale", String(scale));
		}
		fit();
		window.addEventListener("resize", fit);
		return () => window.removeEventListener("resize", fit);
	}, []);
}

function App() {
	const { openedApps } = useAppsManager();
	const { openedPopUps } = usePopUpsManager();

	useFitToViewport();

	const appsDisplayParentRef = useRef(null);

	const terminalRef = useRef(null);
	const txtRef = useRef(null);
	const myPcRef = useRef(null);
	const synthRef = useRef(null);
	const computerScreenRef = useRef(null);
	const browserRef = useRef(null);
	const ieRef = useRef(null);
	const paintRef = useRef(null);
	const kittRef = useRef(null);

	const [powerState, setPowerState] = useState(POWER_OFF);
	const isDesktopOn = powerState === POWER_ON;

	const [isDriveActive, setIsDriveActive] = useState(false);

	const [isTerminalOpened, setIsTerminalOpened] = useState(false);
	const [isTxtOpened, setIsTxtOpened] = useState(false);
	const [isMyPcOpened, setIsMyPcOpened] = useState(false);
	const [isSynthOpened, setIsSynthOpened] = useState(false);
	const [isBrowserOpened, setIsBrowserOpened] = useState(false);
	const [isIeOpened, setIsIeOpened] = useState(false);
	const [isPaintOpened, setIsPaintOpened] = useState(false);
	const [isKittOpened, setIsKittOpened] = useState(false);

	// Minimize states for each app
	const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
	const [isTxtMinimized, setIsTxtMinimized] = useState(false);
	const [isMyPcMinimized, setIsMyPcMinimized] = useState(false);
	const [isSynthMinimized, setIsSynthMinimized] = useState(false);
	const [isBrowserMinimized, setIsBrowserMinimized] = useState(false);
	const [isIeMinimized, setIsIeMinimized] = useState(false);
	const [isPaintMinimized, setIsPaintMinimized] = useState(false);
	const [isKittMinimized, setIsKittMinimized] = useState(false);

	// Register open/minimize listeners once the desktop (and therefore every AppCore) is mounted.
	useEffect(() => {
		if (!isDesktopOn) {
			return;
		}

		const apps = [
			[terminalRef, setIsTerminalOpened, setIsTerminalMinimized],
			[txtRef, setIsTxtOpened, setIsTxtMinimized],
			[myPcRef, setIsMyPcOpened, setIsMyPcMinimized],
			[synthRef, setIsSynthOpened, setIsSynthMinimized],
			[browserRef, setIsBrowserOpened, setIsBrowserMinimized],
			[ieRef, setIsIeOpened, setIsIeMinimized],
			[paintRef, setIsPaintOpened, setIsPaintMinimized],
			[kittRef, setIsKittOpened, setIsKittMinimized],
		];

		const removers = [];
		for (const [ref, setIsOpened, setIsMinimized] of apps) {
			if (!ref.current) {
				continue;
			}
			removers.push(ref.current.onAppCoreOpenStateChanged(setIsOpened));
			removers.push(ref.current.onAppCoreMinimizeStateChanged(setIsMinimized));
		}

		return () => removers.forEach((remove) => remove());
	}, [isDesktopOn]);

	// Click sound for anything clicked on the desktop.
	useEffect(() => {
		function onClick({ clientX, clientY }) {
			if (!computerScreenRef.current) {
				return;
			}

			const { top, left, width, height } = computerScreenRef.current.getBoundingClientRect();
			if (clientX >= left && clientX <= left + width && clientY >= top && clientY <= top + height) {
				playRetroClick();
			}
		}

		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, []);

	// Floppy drive LED flickers whenever a new app is launched.
	const previousOpenedCount = useRef(0);
	useEffect(() => {
		if (openedApps.length > previousOpenedCount.current) {
			setIsDriveActive(true);
			const id = setTimeout(() => setIsDriveActive(false), 700);
			previousOpenedCount.current = openedApps.length;
			return () => clearTimeout(id);
		}
		previousOpenedCount.current = openedApps.length;
	}, [openedApps.length]);

	const handlePowerButton = () => {
		if (powerState === POWER_OFF) {
			playPowerOnSound();
			setPowerState(POWER_BOOTING);
			return;
		}

		for (const app of openedApps) {
			app.close();
		}
		playShutdownSound();
		setPowerState(POWER_OFF);
	};

	const handleBootFinished = () => {
		setPowerState(POWER_ON);
		playStartupChime();
	};

	const pos = userConfig.iconPositions || {};
	const socialsX = pos.socialsStartX ?? 1;
	const socialsStartY = pos.socialsStartY ?? 0;
	const socialIcons = SOCIAL_ICONS.filter(({ key }) => userConfig.socials[key]).map(({ key, icon, title }, index) => (
		<IconDisplay key={key} icon={icon} title={title} x={socialsX} y={socialsStartY + index} href={userConfig.socials[key]} />
	));

	const sharedAppProps = {
		parentRef: appsDisplayParentRef,
		desktopWidth: DESKTOP_WIDTH,
		desktopHeight: DESKTOP_HEIGHT,
		taskbarHeight: TASKBAR_HEIGHT,
	};

	function renderScreen() {
		if (powerState === POWER_BOOTING) {
			return (
				<div className="computer-screen computer-screen-boot">
					<BootScreen onFinished={handleBootFinished} />
				</div>
			);
		}

		if (powerState === POWER_OFF) {
			return (
				<div className="computer-screen computer-screen-off">
					<span className="screen-off-hint">▶ PRESS POWER</span>
				</div>
			);
		}

		return (
			<div className="computer-screen" ref={computerScreenRef}>
				<div className="pop-ups-container">{openedPopUps.map((popUp) => popUp[1])}</div>

				<img className="computer-screen-background" src={userConfig.wallpaper} alt="" />

				<div className="computer-screen-icons-container" style={{ position: "absolute", width: `${DESKTOP_WIDTH}px`, height: `${DESKTOP_HEIGHT}px` }}>
					{/* Internet Explorer — only rendered if position is defined in config */}
					{pos.internetExplorer && <InternetExplorer iconX={pos.internetExplorer.x} iconY={pos.internetExplorer.y} ref={ieRef} {...sharedAppProps} />}

					{/* Netscape browser — loads browserUrl from config */}
					<Browser iconX={pos.netscape?.x ?? 0} iconY={pos.netscape?.y ?? 0} ref={browserRef} {...sharedAppProps} />

					<IconDisplay icon="icons/new-bin.svg" title="bin" x={pos.bin?.x ?? 14.5} y={pos.bin?.y ?? 6.5} onIconClicked={playErrorSound} />
					<IconDisplay icon="icons/new-folder.svg" title="folder" x={pos.folder?.x ?? 14.5} y={pos.folder?.y ?? 2} onIconClicked={playErrorSound} />

					{socialIcons}

					<Terminal iconX={pos.terminal?.x ?? 14.5} iconY={pos.terminal?.y ?? 0} ref={terminalRef} {...sharedAppProps} />
					<Txt iconX={pos.txt?.x ?? 3} iconY={pos.txt?.y ?? 3} ref={txtRef} {...sharedAppProps} />
					<MyPc iconX={pos.myPc?.x ?? 14.5} iconY={pos.myPc?.y ?? 1} ref={myPcRef} {...sharedAppProps} />
					<Synth iconX={pos.synth?.x ?? 13} iconY={pos.synth?.y ?? 1} ref={synthRef} {...sharedAppProps} />
					<Paint iconX={pos.paint?.x ?? 13} iconY={pos.paint?.y ?? 2} ref={paintRef} {...sharedAppProps} />
					<Kitt iconX={pos.kitt?.x ?? 13} iconY={pos.kitt?.y ?? 0} ref={kittRef} {...sharedAppProps} />
				</div>
				<div className="desktop-taskbar">
					<span className="desktop-taskbar-start">
						<span className="computer-badge-stripes" />
						START
					</span>
				</div>
				<Clock />
				<Volume />
				<Clippy />
				{/* Please, if you're going to copy at least give me credits.*/}
				<div className="copyright-footer">{userConfig.copyright}</div>
			</div>
		);
	}

	return (
		<div className="main" id="computer-main">
			{isDesktopOn && (
				<div className="lock-computer-crt-container">
					<div className="crt-roll-bar" />
					<div className="out-light" />
					<div className="shadow" />
					<div className="lock-computer-screen-container" ref={appsDisplayParentRef}>
						{isTerminalOpened ? terminalRef.current?.render(isTerminalMinimized) : null}
						{isTxtOpened ? txtRef.current?.render(isTxtMinimized) : null}
						{isMyPcOpened ? myPcRef.current?.render(isMyPcMinimized) : null}
						{isSynthOpened ? synthRef.current?.render(isSynthMinimized) : null}
						{isBrowserOpened ? browserRef.current?.render(isBrowserMinimized) : null}
						{isIeOpened ? ieRef.current?.render(isIeMinimized) : null}
						{isPaintOpened ? paintRef.current?.render(isPaintMinimized) : null}
						{isKittOpened ? kittRef.current?.render(isKittMinimized) : null}
					</div>
					<div className="computer-taskbar-container">
						{openedApps.map((appRef) => (
							<TaskBarAppDisplay key={appRef.appearence.title} appRef={appRef} />
						))}
					</div>
				</div>
			)}

			<div className="computer-crt-container">
				<div className="computer-screen-container">{renderScreen()}</div>
				<div className="computer-badge" aria-hidden="true">
					<span className="computer-badge-stripes" />
					<span className="computer-badge-text">SUNSET 586</span>
				</div>
				<div className="computer-button-container">
					<div className={`computer-button-light ${powerState !== POWER_OFF ? "on" : ""}`} />
					<button className="computer-button" onClick={handlePowerButton} aria-label={powerState === POWER_OFF ? "Power on" : "Power off"} />
				</div>
			</div>

			<div className="computer-stand"></div>

			<div className="computer-case">
				<div className="computer-diskhat-container" style={{ height: "100%", width: "100%" }}>
					<div className="computer-diskhat">
						<div className="computer-diskhat-input-container">
							<div className="computer-diskhat-input">
								<div className="computer-diskhat-input-2"></div>
							</div>

							<div className="computer-diskhat-button-container" style={{ height: "100px", width: "300px", position: "absolute" }}>
								<div className={`computer-diskhat-led ${isDriveActive || powerState === POWER_BOOTING ? "active" : ""}`} />
								<div className="computer-diskhat-button"></div>
							</div>
						</div>
					</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", paddingTop: "30px" }}>
					<div className="computer-turn-button-container">
						<button className="computer-turn-button" onClick={handlePowerButton} aria-label="Power" />
					</div>

					<div className="computer-case-fans-container">
						<img src="icons/fans.png" style={{ width: "279px", height: "80px" }} alt=""></img>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
