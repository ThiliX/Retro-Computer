import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { ACESFilmicToneMapping, Fog, PCFSoftShadowMap } from "three";

import "./Room3D.css";
import GamingRoom, { MONITOR_SCREEN_HEIGHT, MONITOR_SCREEN_WIDTH, QualityContext } from "./GamingRoom";
import CameraRig, { ROOM_CAMERA_POSITION } from "./CameraRig";
import ScreenProjector from "./ScreenProjector";
import RetroBox, { HOST_HEIGHT, HOST_WIDTH } from "./RetroBox";
import { FrameThrottle, PerformanceWatcher } from "./FrameControl";
import { detectInitialQuality } from "./quality";

// RGB schemes, cycled by clicking the neon sign or hex panels. Sunset colours first.
const PALETTES = [
	["#ff2e88", "#ff7a1a", "#ffb627"], // sunset
	["#e8352b", "#ff5a1a", "#ff9a3a"], // ember
	["#ff2e88", "#9b4dff", "#2ec4b6"], // synthwave
	["#2ec4b6", "#ff7a1a", "#ff2e88"], // dusk
];

// Low-power mode redraws the room at this rate instead of every display frame.
const LOW_POWER_FPS = 24;

/**
 * Present-day gaming room. The modern PC's monitor shows RetroBox, an emulator
 * running the 90s Sunset OS (passed in as `screen`). The host screen is pinned to
 * the monitor with CSS and becomes interactive once the visitor sits down.
 *
 * Performance:
 *  - "high": shadows, bloom, all accent lights, 60 fps in the room.
 *  - "low" (no hardware acceleration, or a slow frame rate): no shadows, bloom
 *    or accent lights, lower resolution, room redrawn at 24 fps.
 *  - In both, the 3D scene stops rendering entirely once the visitor is seated,
 *    since the screen covers it; only the HTML desktop keeps updating.
 */
function Room3D({ screen, powerState, isZoomed, isDriveActive, onSitDown, onStandUp, onOpenClassic, onReset, onInsertDisk }) {
	const anchorRef = useRef(null);
	const viewerRef = useRef(null);
	const cameraElRef = useRef(null);
	const screenElRef = useRef(null);

	const [paletteIndex, setPaletteIndex] = useState(0);
	const [hoverLabel, setHoverLabel] = useState(null);
	const [quality, setQuality] = useState(detectInitialQuality);
	const [isSettled, setIsSettled] = useState(false);
	const [isLowPowerNoteHidden, setIsLowPowerNoteHidden] = useState(false);
	const palette = PALETTES[paletteIndex];

	const isLow = quality === "low";
	const isSeated = isZoomed && isSettled;

	const cyclePalette = useCallback(() => setPaletteIndex((i) => (i + 1) % PALETTES.length), []);
	const handleSlowFrameRate = useCallback(() => setQuality("low"), []);

	useEffect(() => () => (document.body.style.cursor = "auto"), []);

	return (
		<div className={`room3d ${isLow ? "low" : ""}`}>
			<Canvas
				// remount when quality changes so shadow and post-processing setup start clean
				key={quality}
				className="room3d-canvas"
				frameloop={isLow || isSeated ? "demand" : "always"}
				shadows={isLow ? false : { type: PCFSoftShadowMap }}
				dpr={isLow ? [0.75, 1] : [1, 2]}
				camera={{ fov: 50, near: 0.05, far: 30, position: ROOM_CAMERA_POSITION }}
				gl={{ antialias: false, powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping, toneMappingExposure: isLow ? 1.3 : 1.1 }}
				onCreated={({ scene, gl }) => {
					scene.fog = new Fog("#0b0810", 5, 11);
					gl.setClearColor("#0b0810");
				}}
				onPointerMissed={() => {
					if (isZoomed) onStandUp();
				}}
			>
				<QualityContext.Provider value={quality}>
					<GamingRoom
						powerState={powerState}
						palette={palette}
						anchorRef={anchorRef}
						onSitDown={onSitDown}
						onOpenClassic={onOpenClassic}
						onCyclePalette={cyclePalette}
						onHoverLabel={isZoomed ? undefined : setHoverLabel}
					/>
				</QualityContext.Provider>
				<CameraRig isZoomed={isZoomed} anchorRef={anchorRef} screenWidth={MONITOR_SCREEN_WIDTH} screenHeight={MONITOR_SCREEN_HEIGHT} onSettledChange={setIsSettled} />
				<ScreenProjector
					anchorRef={anchorRef}
					viewerRef={viewerRef}
					cameraElRef={cameraElRef}
					screenElRef={screenElRef}
					screenWidthMetres={MONITOR_SCREEN_WIDTH}
					elementWidthPx={HOST_WIDTH}
					elementHeightPx={HOST_HEIGHT}
					flat={isSeated}
				/>
				<FrameThrottle active={isLow && !isSeated} fps={LOW_POWER_FPS} />
				<PerformanceWatcher enabled={!isLow && !isZoomed} onSlow={handleSlowFrameRate} />
				{!isLow && (
					<EffectComposer multisampling={4}>
						<Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.9} />
						<Vignette offset={0.3} darkness={0.55} />
					</EffectComposer>
				)}
			</Canvas>

			{/* CSS layer holding the live host screen, aligned to the monitor */}
			<div className="room3d-css-viewer" ref={viewerRef}>
				<div className="room3d-css-camera" ref={cameraElRef}>
					<div className={`room3d-screen ${isZoomed ? "interactive" : ""} ${powerState === "off" ? "off" : ""}`} ref={screenElRef}>
						<RetroBox screen={screen} powerState={powerState} isDriveActive={isDriveActive} onReset={onReset} onInsertDisk={onInsertDisk} />
					</div>
				</div>
			</div>

			{!isZoomed && hoverLabel && <div className="room3d-hover-label">{hoverLabel}</div>}

			{isLow && !isZoomed && !isLowPowerNoteHidden && (
				<div className="room3d-low-power-note">
					<span>Low-power 3D: hardware acceleration looks off, so lighting effects are reduced. Classic 2D is the smoothest option.</span>
					<button onClick={onOpenClassic}>Classic 2D</button>
					<button onClick={() => setIsLowPowerNoteHidden(true)} aria-label="Dismiss">
						✕
					</button>
				</div>
			)}
		</div>
	);
}

export default Room3D;
