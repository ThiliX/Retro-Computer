import React, { useEffect, useRef, useState } from "react";

import "./App.css";

import IconDisplay from "./components/IconDisplay";
import Clock from "./components/Clock";
import TaskBarAppDisplay from "./components/TaskBarAppDisplay";
import Volume from "./components/Volume";
import Clippy from "./components/Clippy";

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

// ─── Retro sound effects (generated via Web Audio API) ───
let globalAudioCtx = null;
function getAudioCtx() {
	if (!globalAudioCtx) {
		globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}
	if (globalAudioCtx.state === 'suspended') {
		globalAudioCtx.resume();
	}
	return globalAudioCtx;
}

function playRetroClick() {
	try {
		const ctx = getAudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine"; // Changed from square to sine for a softer, more pleasant click
		osc.frequency.setValueAtTime(800, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
		gain.gain.setValueAtTime(0.15, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.08);
	} catch (e) { /* silently fail */ }
}

function playBootSound() {
	try {
		const ctx = getAudioCtx();
		
		// Simulate a satisfying mechanical "click-clack" of a heavy power switch being turned ON
		// First contact (higher pitch 'click')
		const click1Osc = ctx.createOscillator();
		const click1Gain = ctx.createGain();
		click1Osc.type = "square";
		click1Osc.frequency.setValueAtTime(800, ctx.currentTime);
		click1Osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.02);
		click1Gain.gain.setValueAtTime(0.5, ctx.currentTime);
		click1Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
		click1Osc.connect(click1Gain);
		click1Gain.connect(ctx.destination);
		click1Osc.start(ctx.currentTime);
		click1Osc.stop(ctx.currentTime + 0.02);

		// Bottoming out (lower pitch, heavier 'clack' 35ms later)
		const click2Osc = ctx.createOscillator();
		const click2Gain = ctx.createGain();
		click2Osc.type = "triangle";
		click2Osc.frequency.setValueAtTime(150, ctx.currentTime + 0.035);
		click2Osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);
		click2Gain.gain.setValueAtTime(0.6, ctx.currentTime + 0.035);
		click2Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
		click2Osc.connect(click2Gain);
		click2Gain.connect(ctx.destination);
		click2Osc.start(ctx.currentTime + 0.035);
		click2Osc.stop(ctx.currentTime + 0.08);

	} catch (e) { /* silently fail */ }
}

function playShutdownSound() {
	try {
		const ctx = getAudioCtx();
		
		// Simulate the switch being turned OFF (Reverse sequence: heavy pull, then snap)
		// Initial heavy pull
		const click1Osc = ctx.createOscillator();
		const click1Gain = ctx.createGain();
		click1Osc.type = "triangle";
		click1Osc.frequency.setValueAtTime(120, ctx.currentTime);
		click1Osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.05);
		click1Gain.gain.setValueAtTime(0.5, ctx.currentTime);
		click1Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
		click1Osc.connect(click1Gain);
		click1Gain.connect(ctx.destination);
		click1Osc.start(ctx.currentTime);
		click1Osc.stop(ctx.currentTime + 0.05);

		// Switch snaps back up
		const click2Osc = ctx.createOscillator();
		const click2Gain = ctx.createGain();
		click2Osc.type = "square";
		click2Osc.frequency.setValueAtTime(600, ctx.currentTime + 0.04);
		click2Osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.06);
		click2Gain.gain.setValueAtTime(0.4, ctx.currentTime + 0.04);
		click2Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
		click2Osc.connect(click2Gain);
		click2Gain.connect(ctx.destination);
		click2Osc.start(ctx.currentTime + 0.04);
		click2Osc.stop(ctx.currentTime + 0.06);

	} catch (e) { /* silently fail */ }
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
	} catch (e) { /* silently fail */ }
}

// Make sounds available globally for other components
window.retroSounds = { playRetroClick, playBootSound, playShutdownSound, playErrorSound };

function App() {
	const { openedApps } = useAppsManager();
	const { openedPopUps } = usePopUpsManager();

	const appsDisplayParentRef = useRef(null);
	const appsTaskBarParentRef = useRef(null);

	const terminalRef = useRef(null);
	const txtRef = useRef(null);
	const myPcRef = useRef(null);
	const synthRef = useRef(null);
	const computerScreenRef = useRef(null);
	const browserRef = useRef(null);
	const ieRef = useRef(null);
	const paintRef = useRef(null);
	const kittRef = useRef(null);

	const [isTerminalOpened, setIsTerminalOpened] = useState(false);
	const [isTxtOpened, setIsTxtOpened] = useState(false);
	const [isMyPcOpened, setIsMyPcOpened] = useState(false);
	const [isScreenTurnedOn, setIsScreenTurnedOn] = useState(false);
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

	const appsStateMap = {
		terminal: { ref: terminalRef, isOpened: isTerminalOpened, setIsOpened: setIsTerminalOpened, setIsMinimized: setIsTerminalMinimized },
		txt: { ref: txtRef, isOpened: isTxtOpened, setIsOpened: setIsTxtOpened, setIsMinimized: setIsTxtMinimized },
		mypc: { ref: myPcRef, isOpened: isMyPcOpened, setIsOpened: setIsMyPcOpened, setIsMinimized: setIsMyPcMinimized },
		synth: { ref: synthRef, isOpened: isSynthOpened, setIsOpened: setIsSynthOpened, setIsMinimized: setIsSynthMinimized },
		browser: { ref: browserRef, isOpened: isBrowserOpened, setIsOpened: setIsBrowserOpened, setIsMinimized: setIsBrowserMinimized },
		ie: { ref: ieRef, isOpened: isIeOpened, setIsOpened: setIsIeOpened, setIsMinimized: setIsIeMinimized },
		paint: { ref: paintRef, isOpened: isPaintOpened, setIsOpened: setIsPaintOpened, setIsMinimized: setIsPaintMinimized },
		kitt: { ref: kittRef, isOpened: isKittOpened, setIsOpened: setIsKittOpened, setIsMinimized: setIsKittMinimized },
	};

	useEffect(() => {
		const registeredStateListeners = [];

		for (const [key, { ref, setIsOpened, setIsMinimized }] of Object.entries(appsStateMap)) {
			if (ref?.current) {
				registeredStateListeners.push(
					ref.current.onAppCoreOpenStateChanged((isOpened) => {
						setIsOpened(isOpened);
					})
				);
				registeredStateListeners.push(
					ref.current.onAppCoreMinimizeStateChanged((isMinimized) => {
						setIsMinimized(isMinimized);
					})
				);
			}
		}

		return () => {
			registeredStateListeners.forEach((removeListener) => removeListener());
		};
	}, [terminalRef, txtRef, myPcRef, synthRef, isScreenTurnedOn, browserRef, ieRef, paintRef, kittRef]);

	useEffect(() => {
		function onClick({ x, y }) {
			if (!computerScreenRef.current) {
				return;
			}

			const { top, left, width, height } = computerScreenRef.current.getBoundingClientRect();

			if (x >= left && x <= left + width && y >= top && y <= top + height) {
				playRetroClick();
			}
		}

		document.addEventListener("click", onClick);

		return () => {
			document.removeEventListener("click", onClick);
		};
	}, []);

	const handleToggleScreen = () => {
		for (const app of openedApps) {
			app.close();
		}

		setIsScreenTurnedOn((previousState) => {
			if (previousState) {
				playShutdownSound();
			} else {
				playBootSound();
			}
			return !previousState;
		});
	};

	// Build social icons from config — use separate position from app icons
	const pos = userConfig.iconPositions || {};
	const socialsX = pos.socialsStartX ?? 1;
	const socialsStartY = pos.socialsStartY ?? 0;
	const socialIcons = [];
	if (userConfig.socials.github) {
		socialIcons.push(
			<IconDisplay key="github" icon="icons/github.png" title="github" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.github} />
		);
	}
	if (userConfig.socials.twitter) {
		socialIcons.push(
			<IconDisplay key="twitter" icon="icons/x.png" title="twitter" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.twitter} />
		);
	}
	if (userConfig.socials.instagram) {
		socialIcons.push(
			<IconDisplay key="instagram" icon="icons/instagram.png" title="instagram" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.instagram} />
		);
	}
	if (userConfig.socials.spotify) {
		socialIcons.push(
			<IconDisplay key="spotify" icon="icons/spotify.png" title="spotify" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.spotify} />
		);
	}
	if (userConfig.socials.steam) {
		socialIcons.push(
			<IconDisplay key="steam" icon="icons/steam.png" title="steam" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.steam} />
		);
	}
	if (userConfig.socials.linkedin) {
		socialIcons.push(
			<IconDisplay key="linkedin" icon="icons/linkedin.svg" title="linkedin" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.linkedin} />
		);
	}
	if (userConfig.socials.youtube) {
		socialIcons.push(
			<IconDisplay key="youtube" icon="icons/youtube.png" title="youtube" x={socialsX} y={socialsStartY + socialIcons.length} href={userConfig.socials.youtube} />
		);
	}

	return (
		<div className="main" id="computer-main">
			{!isScreenTurnedOn && (
				<div className="lock-computer-crt-container">
					<img className="glitch-screen-effect" src="icons/glitch.gif" alt="" />
					<div className="out-light" />
					<div className="shadow" />
					<div className="lock-computer-screen-container" ref={appsDisplayParentRef}>
						{isTerminalOpened ? terminalRef?.current?.render(isTerminalMinimized) : null}
						{isTxtOpened ? txtRef?.current?.render(isTxtMinimized) : null}
						{isMyPcOpened ? myPcRef?.current?.render(isMyPcMinimized) : null}
						{isSynthOpened ? synthRef?.current?.render(isSynthMinimized) : null}
						{isBrowserOpened ? browserRef?.current?.render(isBrowserMinimized) : null}
						{isIeOpened ? ieRef?.current?.render(isIeMinimized) : null}
						{isPaintOpened ? paintRef?.current?.render(isPaintMinimized) : null}
						{isKittOpened ? kittRef?.current?.render(isKittMinimized) : null}
					</div>
					<div className="computer-taskbar-container" ref={appsTaskBarParentRef}>
						{openedApps.map((appRef, idx) => {
							return <TaskBarAppDisplay key={idx} appRef={appRef} />;
						})}
					</div>
				</div>
			)}

			<div className="computer-crt-container">
				<div className="computer-screen-container">
					{!isScreenTurnedOn ? (
						<div className="computer-screen" ref={computerScreenRef}>
							<div className="pop-ups-container">
								{Object.values(openedPopUps).map((popUp) => {
									return popUp[1];
								})}
							</div>

							<img className="computer-screen-background" src={userConfig.wallpaper} style={{ width: "100%", height: "100%", overflow: "hidden" }} alt="" />

							<div
								className="computer-screen-icons-container"
								style={{ position: "absolute", width: `${DESKTOP_HEIGHT}px`, height: `${DESKTOP_HEIGHT}px` }}
							>
								{/* Internet Explorer — only rendered if position is defined in config */}
								{pos.internetExplorer && (
									<InternetExplorer
										iconX={pos.internetExplorer.x}
										iconY={pos.internetExplorer.y}
										ref={ieRef}
										parentRef={appsDisplayParentRef}
										desktopWidth={DESKTOP_WIDTH}
										desktopHeight={DESKTOP_HEIGHT}
										taskbarHeight={TASKBAR_HEIGHT}
									/>
								)}

								{/* Netscape browser — loads browserUrl from config */}
								<Browser
									iconX={pos.netscape?.x ?? 0}
									iconY={pos.netscape?.y ?? 0}
									ref={browserRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>

								<IconDisplay icon="icons/new-bin.svg" title="bin" x={pos.bin?.x ?? 14.5} y={pos.bin?.y ?? 6.5} />
								<IconDisplay icon="icons/new-folder.svg" title="folder" x={pos.folder?.x ?? 14.5} y={pos.folder?.y ?? 2} />

								{/* Social link icons from config */}
								{socialIcons}

								<Terminal
									iconX={pos.terminal?.x ?? 14.5}
									iconY={pos.terminal?.y ?? 0}
									ref={terminalRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>
								<Txt
									iconX={pos.txt?.x ?? 3}
									iconY={pos.txt?.y ?? 3}
									ref={txtRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>
								<MyPc
									iconX={pos.myPc?.x ?? 14.5}
									iconY={pos.myPc?.y ?? 1}
									ref={myPcRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>
								<Synth
									iconX={pos.synth?.x ?? 13}
									iconY={pos.synth?.y ?? 1}
									ref={synthRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>
								<Paint
									iconX={pos.paint?.x ?? 13}
									iconY={pos.paint?.y ?? 2}
									ref={paintRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>
								<Kitt
									iconX={pos.kitt?.x ?? 13}
									iconY={pos.kitt?.y ?? 0}
									ref={kittRef}
									parentRef={appsDisplayParentRef}
									desktopWidth={DESKTOP_WIDTH}
									desktopHeight={DESKTOP_HEIGHT}
									taskbarHeight={TASKBAR_HEIGHT}
								/>
							</div>
							<Clock />
							<Volume />
							<Clippy />
							{/* Please, if you're going to copy at least give me credits.*/}
							<div className="copyright-footer">
								{userConfig.copyright}
							</div>
						</div>
					) : (
						<div className="computer-screen" style={{ backgroundColor: "black" }} />
					)}
				</div>
				<div className="computer-button-container">
					<div className="computer-button-light" style={isScreenTurnedOn ? { backgroundColor: "red", boxShadow: "0px 0px 25px 1px red" } : {}}></div>
					<button className="computer-button" onClick={handleToggleScreen}></button>
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
								<div className="computer-diskhat-button"></div>
							</div>
						</div>
					</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", paddingTop: "30px" }}>
					<div className="computer-turn-button-container">
						<button className="computer-turn-button"></button>
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
