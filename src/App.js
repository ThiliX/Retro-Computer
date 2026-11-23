import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./App.css";

import IconDisplay, { ICON_CELL_HEIGHT } from "./components/IconDisplay";
import Clock from "./components/Clock";
import TaskBarAppDisplay from "./components/TaskBarAppDisplay";
import Volume from "./components/Volume";
import BootScreen from "./components/BootScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import StartMenu from "./components/StartMenu";
import PowerDialog from "./components/PowerDialog";
import MessageBox from "./components/MessageBox";
import Balloon from "./components/Balloon";

import Terminal from "./apps/Terminal/Terminal";
import Txt from "./apps/Txt/Txt";
import MyPc from "./apps/MyPc/MyPc";
import Synth from "./apps/Synth/Synth";
import Paint from "./apps/Paint/Paint";
import Browser from "./apps/Browser/Browser";
import Kitt from "./apps/Kitt/Kitt";

import { useAppsManager } from "./context/AppsManagerContext";
import { DesktopSelectionContext } from "./context/DesktopSelectionContext";
import userConfig from "./userConfig";
import * as sound from "./audio/xpAudio";

const TASKBAR_HEIGHT = 30;
const DEFAULT_WALLPAPER = "icons/xp/hills.svg";

// boot → login → welcome → desktop; then loggingOff / shuttingDown → login / off.
const PHASE_OFF = "off";
const PHASE_BOOT = "boot";
const PHASE_LOGIN = "login";
const PHASE_WELCOME = "welcome";
const PHASE_DESKTOP = "desktop";
const PHASE_LOGGING_OFF = "loggingOff";
const PHASE_SHUTTING_DOWN = "shuttingDown";
const PHASE_STANDBY = "standby";

// Social shortcuts on the desktop and in the Start menu.
const SOCIAL_LINKS = [
	{ key: "github", icon: "icons/github.svg", title: "GitHub" },
	{ key: "linkedin", icon: "icons/linkedin.svg", title: "LinkedIn" },
	{ key: "twitter", icon: "icons/x.png", title: "X" },
	{ key: "instagram", icon: "icons/instagram.png", title: "Instagram" },
	{ key: "steam", icon: "icons/steam.png", title: "Steam" },
	{ key: "spotify", icon: "icons/spotify.png", title: "Spotify" },
	{ key: "youtube", icon: "icons/youtube.svg", title: "YouTube" },
].filter(({ key }) => userConfig.socials[key]);

function useViewportSize() {
	const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
	useEffect(() => {
		const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);
	return size;
}

function App() {
	const { openedApps, unfocusApp } = useAppsManager();
	const viewport = useViewportSize();

	const appsDisplayParentRef = useRef(null);
	const timeoutsRef = useRef([]);
	const hasStartedUpRef = useRef(false);

	const terminalRef = useRef(null);
	const txtRef = useRef(null);
	const myPcRef = useRef(null);
	const synthRef = useRef(null);
	const browserRef = useRef(null);
	const paintRef = useRef(null);
	const kittRef = useRef(null);

	const [phase, setPhase] = useState(PHASE_BOOT);
	const isDesktop = phase === PHASE_DESKTOP;

	const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
	const [powerDialog, setPowerDialog] = useState(null); // "turnOff" | "logOff" | null
	const [messageBox, setMessageBox] = useState(null);
	const [selectedIcon, setSelectedIcon] = useState(null);

	const [openState, setOpenState] = useState({});
	const [minimizedState, setMinimizedState] = useState({});

	const apps = useMemo(
		() => [
			{ key: "myPc", ref: myPcRef },
			{ key: "txt", ref: txtRef },
			{ key: "terminal", ref: terminalRef },
			{ key: "browser", ref: browserRef },
			{ key: "paint", ref: paintRef },
			{ key: "synth", ref: synthRef },
			{ key: "kitt", ref: kittRef },
		],
		[]
	);

	// Track open/minimized state of every window once the desktop is mounted.
	useEffect(() => {
		if (!isDesktop) return;
		const removers = [];
		for (const { key, ref } of apps) {
			if (!ref.current) continue;
			removers.push(ref.current.onAppCoreOpenStateChanged((isOpen) => setOpenState((s) => ({ ...s, [key]: isOpen }))));
			removers.push(ref.current.onAppCoreMinimizeStateChanged((isMin) => setMinimizedState((s) => ({ ...s, [key]: isMin }))));
		}
		return () => removers.forEach((remove) => remove());
	}, [isDesktop, apps]);

	function later(fn, ms) {
		timeoutsRef.current.push(setTimeout(fn, ms));
	}

	useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

	function closeAllApps() {
		for (const app of openedApps) app.close();
		setOpenState({});
		setMinimizedState({});
	}

	const handleBootFinished = useCallback(() => setPhase(PHASE_LOGIN), []);

	function handleLogin() {
		setPhase(PHASE_WELCOME);
		// The first log-on after boot plays the full startup sound; later ones the short chime.
		if (!hasStartedUpRef.current) {
			hasStartedUpRef.current = true;
			sound.playStartup();
		} else {
			sound.playLogon();
		}
		later(() => setPhase(PHASE_DESKTOP), 1600);
	}

	function logOff() {
		setPowerDialog(null);
		closeAllApps();
		sound.playLogoff();
		setPhase(PHASE_LOGGING_OFF);
		later(() => setPhase(PHASE_LOGIN), 1800);
	}

	function shutDown(thenRestart) {
		setPowerDialog(null);
		closeAllApps();
		sound.playShutdown();
		setPhase(PHASE_SHUTTING_DOWN);
		later(() => {
			hasStartedUpRef.current = false;
			setPhase(thenRestart ? PHASE_BOOT : PHASE_OFF);
		}, 2600);
	}

	function handlePowerChoice(choice) {
		if (choice === "turnOff") shutDown(false);
		else if (choice === "restart") shutDown(true);
		else if (choice === "standby") {
			setPowerDialog(null);
			setPhase(PHASE_STANDBY);
		} else if (choice === "logOff") logOff();
		else if (choice === "switchUser") {
			setPowerDialog(null);
			sound.playLogoff();
			setPhase(PHASE_LOGIN); // windows stay open, like fast user switching
		}
	}

	function openApp(ref) {
		sound.playClick();
		ref.current?.open();
	}

	function showMessage(box) {
		if (box.kind === "error") sound.playError();
		else sound.playNotify();
		setMessageBox(box);
	}

	function emptyRecycleBin() {
		sound.playRecycle();
		setMessageBox({
			title: "Recycle Bin",
			kind: "info",
			message: "The Recycle Bin is now empty. Every unfinished side project has been permanently deleted. (Just kidding, they live on GitHub.)",
		});
	}

	function openMyDocuments() {
		showMessage({
			title: "My Documents",
			kind: "error",
			message: "My Documents is not accessible. Access is denied. Try GitHub for the source code instead.",
		});
	}

	function showHelp() {
		showMessage({
			title: "Help and Support",
			kind: "info",
			message: `Welcome to ${userConfig.osOwner} ${userConfig.osName}! Double-click icons to open them, drag windows by their title bar and use the taskbar to switch between them. Try "help" in the Command Prompt.`,
		});
	}

	const sharedAppProps = {
		parentRef: appsDisplayParentRef,
		desktopWidth: viewport.width,
		desktopHeight: viewport.height,
		taskbarHeight: TASKBAR_HEIGHT,
	};

	// Desktop icons flow top-to-bottom, then into the next column, like XP's auto-arrange.
	const rows = Math.max(1, Math.floor((viewport.height - TASKBAR_HEIGHT - 12) / ICON_CELL_HEIGHT));
	const cell = (index) => ({ x: Math.floor(index / rows), y: index % rows });
	let slot = 0;
	const next = () => cell(slot++);

	const appIcon = (Component, ref) => {
		const { x, y } = next();
		return <Component iconX={x} iconY={y} ref={ref} {...sharedAppProps} />;
	};

	function renderDesktop() {
		const myPcIcon = appIcon(MyPc, myPcRef);
		const docs = next();
		const bin = next();
		const browserIcon = appIcon(Browser, browserRef);
		const txtIcon = appIcon(Txt, txtRef);
		const terminalIcon = appIcon(Terminal, terminalRef);
		const paintIcon = appIcon(Paint, paintRef);
		const synthIcon = appIcon(Synth, synthRef);
		const kittIcon = appIcon(Kitt, kittRef);
		const socialIcons = SOCIAL_LINKS.map(({ key, icon, title }) => {
			const { x, y } = next();
			return <IconDisplay key={key} icon={icon} title={title} x={x} y={y} href={userConfig.socials[key]} isShortcut />;
		});

		return (
			<div
				className={`xp-desktop ${powerDialog ? "greyed" : ""}`}
				onMouseDown={(event) => {
					// only clicks on the bare desktop clear the selection; windows bubble up here too
					if (event.target.closest(".xp-window, .xp-taskbar, .xp-message-overlay")) return;
					setSelectedIcon(null);
					unfocusApp();
				}}
			>
				<img
					className="xp-wallpaper"
					src={userConfig.wallpaper}
					alt=""
					draggable={false}
					// fall back to the built-in hills if the configured file is missing
					onError={(event) => {
						if (!event.currentTarget.src.endsWith(DEFAULT_WALLPAPER)) event.currentTarget.src = DEFAULT_WALLPAPER;
					}}
				/>

				<div className="xp-desktop-icons">
					{myPcIcon}
					<IconDisplay icon="icons/xp/documents.svg" title="My Documents" x={docs.x} y={docs.y} onIconClicked={openMyDocuments} />
					<IconDisplay icon="icons/xp/recycle-bin.svg" title="Recycle Bin" x={bin.x} y={bin.y} onIconClicked={emptyRecycleBin} />
					{browserIcon}
					{txtIcon}
					{terminalIcon}
					{paintIcon}
					{synthIcon}
					{kittIcon}
					{socialIcons}
				</div>

				{/* Open windows live in their own layer above the icons */}
				<div className="windows-layer" ref={appsDisplayParentRef} style={{ bottom: TASKBAR_HEIGHT }}>
					{apps.map(({ key, ref }) => (openState[key] ? <React.Fragment key={key}>{ref.current?.render(minimizedState[key])}</React.Fragment> : null))}
					{messageBox && <MessageBox {...messageBox} onClose={() => setMessageBox(null)} />}
				</div>

				{renderTaskbar()}
			</div>
		);
	}

	function renderTaskbar() {
		const item = (label, icon, action, extra = {}) => ({ label, icon, action, ...extra });
		const programs = [
			item("Internet", "icons/xp/internet.svg", () => openApp(browserRef), { subtitle: "Web Browser", bold: true }),
			item("Command Prompt", "icons/xp/cmd.svg", () => openApp(terminalRef), { subtitle: "Type 'help' to start", bold: true }),
		];
		const recent = [
			item("About Me - Notepad", "icons/xp/notepad.svg", () => openApp(txtRef)),
			item("Paint", "icons/xp/paint.svg", () => openApp(paintRef)),
			item("Synth-80", "icons/xp/synth.svg", () => openApp(synthRef)),
			item("K.I.T.T.", "icons/xp/kitt.svg", () => openApp(kittRef)),
		];
		const allPrograms = [
			item("Command Prompt", "icons/xp/cmd.svg", () => openApp(terminalRef)),
			item("Internet", "icons/xp/internet.svg", () => openApp(browserRef)),
			item("K.I.T.T.", "icons/xp/kitt.svg", () => openApp(kittRef)),
			item("Notepad", "icons/xp/notepad.svg", () => openApp(txtRef)),
			item("Paint", "icons/xp/paint.svg", () => openApp(paintRef)),
			item("Synth-80", "icons/xp/synth.svg", () => openApp(synthRef)),
			item("System Properties", "icons/xp/computer.svg", () => openApp(myPcRef)),
		];
		const places = [item("My Documents", "icons/xp/documents.svg", openMyDocuments), item("My Computer", "icons/xp/computer.svg", () => openApp(myPcRef))];
		const links = SOCIAL_LINKS.map(({ key, icon, title }) => ({ label: title, icon, href: userConfig.socials[key] }));
		const system = [item("Help and Support", "icons/xp/help.svg", showHelp), item("Run...", "icons/xp/run.svg", () => openApp(terminalRef))];

		return (
			<div className="xp-taskbar" style={{ height: TASKBAR_HEIGHT }} onMouseDown={(e) => e.stopPropagation()}>
				<button className={`xp-start-button ${isStartMenuOpen ? "pressed" : ""}`} onClick={() => setIsStartMenuOpen((open) => !open)}>
					<img src="icons/xp/logo.svg" alt="" />
					<span>start</span>
				</button>

				<div className="xp-taskbar-apps">
					{openedApps.map((appRef) => {
						const key = apps.find(({ ref }) => ref.current === appRef)?.key;
						return <TaskBarAppDisplay key={appRef.appearence.title} appRef={appRef} isMinimized={!!minimizedState[key]} />;
					})}
				</div>

				<div className="xp-tray">
					<Volume />
					<Clock />
				</div>

				{isStartMenuOpen && (
					<StartMenu
						pinned={programs}
						recent={recent}
						allPrograms={allPrograms}
						places={places}
						links={links}
						system={system}
						onLogOff={() => setPowerDialog("logOff")}
						onTurnOff={() => setPowerDialog("turnOff")}
						onClose={closeStartMenu}
					/>
				)}

				<Balloon />
			</div>
		);
	}

	const closeStartMenu = useCallback(() => setIsStartMenuOpen(false), []);

	function renderScreen() {
		switch (phase) {
			case PHASE_BOOT:
				return <BootScreen onFinished={handleBootFinished} />;
			case PHASE_LOGIN:
			case PHASE_WELCOME:
			case PHASE_LOGGING_OFF:
			case PHASE_SHUTTING_DOWN:
				return <WelcomeScreen mode={phase} onLogin={handleLogin} onTurnOff={() => shutDown(false)} />;
			case PHASE_STANDBY:
				return (
					<button className="xp-standby" onClick={() => setPhase(PHASE_DESKTOP)} autoFocus>
						<span>Click anywhere to wake up</span>
					</button>
				);
			case PHASE_OFF:
				return (
					<div className="xp-off">
						<button className="xp-off-power" onClick={() => setPhase(PHASE_BOOT)} aria-label="Turn on">
							<img src="icons/xp/shutdown.svg" alt="" />
						</button>
						<span>It's now safe to turn on your computer.</span>
					</div>
				);
			default:
				return null;
		}
	}

	return (
		<DesktopSelectionContext.Provider value={{ selectedIcon, selectIcon: setSelectedIcon }}>
			{/* The desktop stays mounted in stand-by and while switching users, so open windows survive. */}
			{(isDesktop || phase === PHASE_STANDBY || (phase === PHASE_LOGIN && openedApps.length > 0)) && (
				<div className="xp-desktop-host" style={{ visibility: isDesktop ? "visible" : "hidden" }}>
					{renderDesktop()}
				</div>
			)}
			{powerDialog && isDesktop && <PowerDialog kind={powerDialog} onChoose={handlePowerChoice} onCancel={() => setPowerDialog(null)} />}
			{renderScreen()}
		</DesktopSelectionContext.Provider>
	);
}

export default App;
