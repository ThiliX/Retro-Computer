import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, Fog, PCFSoftShadowMap } from "three";

import "./Room3D.css";
import RoomScene from "./RoomScene";
import CameraRig, { ROOM_CAMERA_POSITION } from "./CameraRig";
import ScreenProjector from "./ScreenProjector";
import { SCREEN_WIDTH } from "./RetroPC";

const SCREEN_PX_WIDTH = 800;

/**
 * "Bedroom at Dusk, 1997": a small 3D room with the beige PC on a desk.
 * The real desktop (passed in as `screen`) is pinned onto the CRT with CSS 3D
 * and becomes interactive once the visitor sits down.
 */
function Room3D({ screen, powerState, isZoomed, isDriveActive, onSitDown, onStandUp, onPowerButton }) {
	const anchorRef = useRef(null);
	const viewerRef = useRef(null);
	const cameraElRef = useRef(null);
	const screenElRef = useRef(null);

	useEffect(() => () => (document.body.style.cursor = "auto"), []);

	return (
		<div className="room3d">
			<Canvas
				className="room3d-canvas"
				shadows={{ type: PCFSoftShadowMap }}
				dpr={[1, 2]}
				camera={{ fov: 50, near: 0.05, far: 30, position: ROOM_CAMERA_POSITION }}
				gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
				onCreated={({ scene, gl }) => {
					scene.fog = new Fog("#1a0b1e", 4.5, 10);
					gl.setClearColor("#1a0b1e");
				}}
				onPointerMissed={() => {
					if (isZoomed) onStandUp();
				}}
			>
				<RoomScene powerState={powerState} isDriveActive={isDriveActive} anchorRef={anchorRef} onSitDown={onSitDown} onPowerButton={onPowerButton} />
				<CameraRig isZoomed={isZoomed} anchorRef={anchorRef} />
				<ScreenProjector anchorRef={anchorRef} viewerRef={viewerRef} cameraElRef={cameraElRef} screenElRef={screenElRef} screenWidthMetres={SCREEN_WIDTH} elementWidthPx={SCREEN_PX_WIDTH} />
			</Canvas>

			{/* CSS 3D layer holding the live desktop, aligned to the CRT glass every frame */}
			<div className="room3d-css-viewer" ref={viewerRef}>
				<div className="room3d-css-camera" ref={cameraElRef}>
					<div className={`room3d-screen ${isZoomed ? "interactive" : ""}`} ref={screenElRef}>
						{screen}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Room3D;
