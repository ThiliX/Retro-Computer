import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { ACESFilmicToneMapping, Fog, PCFSoftShadowMap } from "three";

import "./Room3D.css";
import GamingRoom, { MONITOR_SCREEN_HEIGHT, MONITOR_SCREEN_WIDTH } from "./GamingRoom";
import CameraRig, { ROOM_CAMERA_POSITION } from "./CameraRig";
import ScreenProjector from "./ScreenProjector";
import RetroBox, { HOST_WIDTH } from "./RetroBox";

// RGB schemes, cycled by clicking the neon sign or hex panels. Sunset colours first.
const PALETTES = [
	["#ff2e88", "#ff7a1a", "#ffb627"], // sunset
	["#e8352b", "#ff5a1a", "#ff9a3a"], // ember
	["#ff2e88", "#9b4dff", "#2ec4b6"], // synthwave
	["#2ec4b6", "#ff7a1a", "#ff2e88"], // dusk
];

/**
 * Present-day gaming room. The modern PC's monitor shows RetroBox, an emulator
 * running the 90s Sunset OS (passed in as `screen`). The host screen is pinned to
 * the monitor with CSS 3D and becomes interactive once the visitor sits down.
 */
function Room3D({ screen, powerState, isZoomed, isDriveActive, onSitDown, onStandUp, onOpenClassic, onReset, onInsertDisk }) {
	const anchorRef = useRef(null);
	const viewerRef = useRef(null);
	const cameraElRef = useRef(null);
	const screenElRef = useRef(null);

	const [paletteIndex, setPaletteIndex] = useState(0);
	const [hoverLabel, setHoverLabel] = useState(null);
	const palette = PALETTES[paletteIndex];

	const cyclePalette = useCallback(() => setPaletteIndex((i) => (i + 1) % PALETTES.length), []);

	useEffect(() => () => (document.body.style.cursor = "auto"), []);

	return (
		<div className="room3d">
			<Canvas
				className="room3d-canvas"
				shadows={{ type: PCFSoftShadowMap }}
				dpr={[1, 2]}
				camera={{ fov: 50, near: 0.05, far: 30, position: ROOM_CAMERA_POSITION }}
				gl={{ antialias: false, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
				onCreated={({ scene, gl }) => {
					scene.fog = new Fog("#0b0810", 5, 11);
					gl.setClearColor("#0b0810");
				}}
				onPointerMissed={() => {
					if (isZoomed) onStandUp();
				}}
			>
				<GamingRoom
					powerState={powerState}
					palette={palette}
					anchorRef={anchorRef}
					onSitDown={onSitDown}
					onOpenClassic={onOpenClassic}
					onCyclePalette={cyclePalette}
					onHoverLabel={isZoomed ? undefined : setHoverLabel}
				/>
				<CameraRig isZoomed={isZoomed} anchorRef={anchorRef} screenWidth={MONITOR_SCREEN_WIDTH} screenHeight={MONITOR_SCREEN_HEIGHT} />
				<ScreenProjector anchorRef={anchorRef} viewerRef={viewerRef} cameraElRef={cameraElRef} screenElRef={screenElRef} screenWidthMetres={MONITOR_SCREEN_WIDTH} elementWidthPx={HOST_WIDTH} />
				<EffectComposer multisampling={4}>
					<Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.9} />
					<Vignette offset={0.3} darkness={0.55} />
				</EffectComposer>
			</Canvas>

			{/* CSS 3D layer holding the live host screen, aligned to the monitor every frame */}
			<div className="room3d-css-viewer" ref={viewerRef}>
				<div className="room3d-css-camera" ref={cameraElRef}>
					<div className={`room3d-screen ${isZoomed ? "interactive" : ""} ${powerState === "off" ? "off" : ""}`} ref={screenElRef}>
						<RetroBox screen={screen} powerState={powerState} isDriveActive={isDriveActive} onReset={onReset} onInsertDisk={onInsertDisk} />
					</div>
				</div>
			</div>

			{!isZoomed && hoverLabel && <div className="room3d-hover-label">{hoverLabel}</div>}
		</div>
	);
}

export default Room3D;
