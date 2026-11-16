import React, { Suspense, lazy, useEffect, useRef, useState } from "react";

import "./App.css";

import IconDisplay from "./components/IconDisplay";
import Clock from "./components/Clock";
import TaskBarAppDisplay from "./components/TaskBarAppDisplay";
import Volume from "./components/Volume";
import Clippy from "./components/Clippy";
import BootScreen from "./components/BootScreen";
import ClassicRig from "./components/ClassicRig";
import WorldHud from "./components/WorldHud";

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
import * as sound from "./audio/retroAudio";

// three.js is only downloaded when the 3D room is actually shown.
const Room3D = lazy(() => import("./world/Room3D"));

const DESKTOP_WIDTH = 800;
const DESKTOP_HEIGHT = 600;
const TASKBAR_HEIGHT = 38;

// "off"     → black glass, waiting for the power button
// "booting" → BIOS POST screen
// "on"      → desktop
const POWER_OFF = "off";
const POWER_BOOTING = "booting";
const POWER_ON = "on";

const VIEW_3D = "3d";
const VIEW_CLASSIC = "classic";
const VIEW_STORAGE_KEY = "retro-pc-view";

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

// Keep the old global API that apps (terminal, etc.) call.
window.retroSounds = {
	playRetroClick: sound.playClick,
	playBootSound: () => sound.playPowerSwitch(true),
	playShutdownSound: () => sound.playPowerSwitch(false),
	playErrorSound: sound.playError,
	playStartupChime: sound.playStartupChime,
};

function supportsWebGL() {
	try {
		const canvas = document.createElement("canvas");
		return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
	} catch (e) {
		return false;
	}
}

function getInitialView() {
	if (!supportsWebGL()) return VIEW_CLASSIC;
	try {
		return window.localStorage.getItem(VIEW_STORAGE_KEY) === VIEW_CLASSIC ? VIEW_CLASSIC : VIEW_3D;
	} catch (e) {
		return VIEW_3D;
	}
}

function App() {
	const { openedApps } = useAppsManager();
	const { openedPopUps } = usePopUpsManager();

	const appsDisplayParentRef = useRef(null);
	const computerScreenRef = useRef(null);

	const terminalRef = useRef(null);
	const txtRef = useRef(null);
	const myPcRef = useRef(null);
	const synthRef = useRef(null);
	const browserRef = useRef(null);
	const ieRef = useRef(null);
	const paintRef = useRef(null);
	const kittRef = useRef(null);

	const [powerState, setPowerState] = useState(POWER_OFF);
	const isDesktopOn = powerState === POWER_ON;

	const [viewMode, setViewMode] = useState(getInitialView);
	const [isZoomed, setIsZoomed] = useState(false);
	const canUseKeyboardOnScreen = viewMode === VIEW_CLASSIC || isZoomed;

	const [isDriveActive, setIsDriveActive] = useState(false);
	const bootTimeoutsRef = useRef([]);

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
	}, [isDesktopOn, viewMode]);

	// Mouse click sound for anything clicked on the screen.
	useEffect(() => {
		function onClick({ target }) {
			if (computerScreenRef.current?.contains(target)) {
				sound.playClick();
			}
		}

		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, []);

	// Keyboard clacks while the visitor is typing at the computer.
	useEffect(() => {
		if (!isDesktopOn || !canUseKeyboardOnScreen) {
			return;
		}

		function onKeyDown(event) {
			if (event.repeat || event.ctrlKey || event.metaKey) return;
			if (event.key.length === 1 || ["Enter", "Backspace", "Tab", "Delete"].includes(event.key)) {
				sound.playKey();
			}
		}

		// Capture phase so apps that stop propagation still sound like a keyboard.
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [isDesktopOn, canUseKeyboardOnScreen]);

	// Floppy LED + hard disk chatter whenever a new app is launched.
	const previousOpenedCount = useRef(0);
	useEffect(() => {
		if (openedApps.length > previousOpenedCount.current) {
			setIsDriveActive(true);
			sound.playHddChatter(0.45);
			const id = setTimeout(() => setIsDriveActive(false), 700);
			previousOpenedCount.current = openedApps.length;
			return () => clearTimeout(id);
		}
		previousOpenedCount.current = openedApps.length;
	}, [openedApps.length]);

	// PC fan hum while powered.
	useEffect(() => {
		sound.setAmbience(powerState !== POWER_OFF);
	}, [powerState]);

	// Across the room the PC sounds muffled; at the desk it is crisp.
	useEffect(() => {
		sound.setListenerNear(viewMode === VIEW_CLASSIC || isZoomed);
	}, [viewMode, isZoomed]);

	function clearBootSounds() {
		bootTimeoutsRef.current.forEach(clearTimeout);
		bootTimeoutsRef.current = [];
	}

	function powerOn() {
		sound.playPowerSwitch(true);
		sound.playCrtPowerOn();
		clearBootSounds();
		bootTimeoutsRef.current = [setTimeout(sound.playPostBeep, 1400), setTimeout(() => sound.playFloppySeek(0.7), 1900), setTimeout(() => sound.playHddChatter(0.9), 2600)];
		setPowerState(POWER_BOOTING);
	}

	function powerOff() {
		for (const app of openedApps) {
			app.close();
		}
		clearBootSounds();
		sound.playPowerSwitch(false);
		sound.playCrtPowerOff();
		setPowerState(POWER_OFF);
	}

	function handlePowerButton() {
		if (powerState === POWER_OFF) {
			powerOn();
		} else {
			powerOff();
		}
	}

	function handleBootFinished() {
		clearBootSounds();
		setPowerState(POWER_ON);
		sound.playStartupChime();
	}

	// Sitting down at the computer also switches it on, like reaching for the button.
	function handleSitDown() {
		setIsZoomed(true);
		if (powerState === POWER_OFF) {
			powerOn();
		}
	}

	function handleStandUp() {
		setIsZoomed(false);
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	function handleToggleView() {
		const next = viewMode === VIEW_3D ? VIEW_CLASSIC : VIEW_3D;
		try {
			window.localStorage.setItem(VIEW_STORAGE_KEY, next);
		} catch (e) {
			/* private mode — the toggle still works for this visit */
		}
		setIsZoomed(false);
		setViewMode(next);
	}

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

	function renderScreenContent() {
		if (powerState === POWER_BOOTING) {
			return <BootScreen onFinished={handleBootFinished} />;
		}

		if (powerState === POWER_OFF) {
			return (
				<div className="screen-off">
					<span className="screen-off-hint">▶ PRESS POWER</span>
				</div>
			);
		}

		return (
			<>
				<div className="pop-ups-container">{openedPopUps.map((popUp) => popUp[1])}</div>

				<img className="computer-screen-background" src={userConfig.wallpaper} alt="" />

				<div className="computer-screen-icons-container" style={{ position: "absolute", width: `${DESKTOP_WIDTH}px`, height: `${DESKTOP_HEIGHT}px` }}>
					{/* Internet Explorer — only rendered if position is defined in config */}
					{pos.internetExplorer && <InternetExplorer iconX={pos.internetExplorer.x} iconY={pos.internetExplorer.y} ref={ieRef} {...sharedAppProps} />}

					{/* Netscape browser — loads browserUrl from config */}
					<Browser iconX={pos.netscape?.x ?? 0} iconY={pos.netscape?.y ?? 0} ref={browserRef} {...sharedAppProps} />

					<IconDisplay icon="icons/new-bin.svg" title="bin" x={pos.bin?.x ?? 14.5} y={pos.bin?.y ?? 6.5} onIconClicked={sound.playError} />
					<IconDisplay icon="icons/new-folder.svg" title="folder" x={pos.folder?.x ?? 14.5} y={pos.folder?.y ?? 2} onIconClicked={sound.playError} />

					{socialIcons}

					<Terminal iconX={pos.terminal?.x ?? 14.5} iconY={pos.terminal?.y ?? 0} ref={terminalRef} {...sharedAppProps} />
					<Txt iconX={pos.txt?.x ?? 3} iconY={pos.txt?.y ?? 3} ref={txtRef} {...sharedAppProps} />
					<MyPc iconX={pos.myPc?.x ?? 14.5} iconY={pos.myPc?.y ?? 1} ref={myPcRef} {...sharedAppProps} />
					<Synth iconX={pos.synth?.x ?? 13} iconY={pos.synth?.y ?? 1} ref={synthRef} {...sharedAppProps} />
					<Paint iconX={pos.paint?.x ?? 13} iconY={pos.paint?.y ?? 2} ref={paintRef} {...sharedAppProps} />
					<Kitt iconX={pos.kitt?.x ?? 13} iconY={pos.kitt?.y ?? 0} ref={kittRef} {...sharedAppProps} />
				</div>

				{/* Open windows live in their own layer above the icons */}
				<div className="windows-layer" ref={appsDisplayParentRef}>
					{isTerminalOpened ? terminalRef.current?.render(isTerminalMinimized) : null}
					{isTxtOpened ? txtRef.current?.render(isTxtMinimized) : null}
					{isMyPcOpened ? myPcRef.current?.render(isMyPcMinimized) : null}
					{isSynthOpened ? synthRef.current?.render(isSynthMinimized) : null}
					{isBrowserOpened ? browserRef.current?.render(isBrowserMinimized) : null}
					{isIeOpened ? ieRef.current?.render(isIeMinimized) : null}
					{isPaintOpened ? paintRef.current?.render(isPaintMinimized) : null}
					{isKittOpened ? kittRef.current?.render(isKittMinimized) : null}
				</div>

				<div className="desktop-taskbar">
					<span className="desktop-taskbar-start">
						<span className="computer-badge-stripes" />
						START
					</span>
					<div className="desktop-taskbar-apps">
						{openedApps.map((appRef) => (
							<TaskBarAppDisplay key={appRef.appearence.title} appRef={appRef} />
						))}
					</div>
				</div>
				<Clock />
				<Volume />
				<Clippy />
				{/* Please, if you're going to copy at least give me credits.*/}
				<div className="copyright-footer">{userConfig.copyright}</div>
			</>
		);
	}

	// The 800×600 screen surface. The same element is shown inside the 2D rig or on the 3D CRT.
	const screen = (
		<div className={`screen-surface ${isDesktopOn ? "" : "screen-surface-dark"}`} ref={computerScreenRef}>
			{renderScreenContent()}
			<div className="crt-roll-bar" />
		</div>
	);

	return (
		<>
			{viewMode === VIEW_3D ? (
				<Suspense fallback={<div className="world-loading">LOADING ROOM…</div>}>
					<Room3D
						screen={screen}
						powerState={powerState}
						isZoomed={isZoomed}
						isDriveActive={isDriveActive || powerState === POWER_BOOTING}
						onSitDown={handleSitDown}
						onStandUp={handleStandUp}
						onPowerButton={handlePowerButton}
					/>
				</Suspense>
			) : (
				<ClassicRig screen={screen} isPoweredOn={powerState !== POWER_OFF} isDriveActive={isDriveActive || powerState === POWER_BOOTING} onPowerButton={handlePowerButton} />
			)}
			<WorldHud viewMode={viewMode} isZoomed={isZoomed} isPoweredOn={powerState !== POWER_OFF} onToggleView={handleToggleView} onStandUp={handleStandUp} onPowerButton={handlePowerButton} />
		</>
	);
}

export default App;
