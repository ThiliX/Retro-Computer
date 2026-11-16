import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import RetroPC from "./RetroPC";
import { createFloorTexture, createPosterTexture, createRugTexture, createSkyTexture, createWallTexture } from "./textures";

const ROOM_WIDTH = 4.8;
const ROOM_HEIGHT = 2.8;
const BACK_WALL_Z = -1.2;
const WALL_THICKNESS = 0.1;

// Window in the back wall, left of the desk
const WINDOW = { x: -1.15, y: 1.6, width: 1.0, height: 0.95 };

export const DESK_TOP_Y = 0.76;

/** Back wall built from four blocks around the window opening, so sunlight only enters through the glass. */
function BackWall({ wallTexture }) {
	const left = WINDOW.x - WINDOW.width / 2;
	const right = WINDOW.x + WINDOW.width / 2;
	const bottom = WINDOW.y - WINDOW.height / 2;
	const top = WINDOW.y + WINDOW.height / 2;
	const halfRoom = ROOM_WIDTH / 2;

	const blocks = [
		// [centerX, centerY, width, height]
		[(-halfRoom + left) / 2, ROOM_HEIGHT / 2, left + halfRoom, ROOM_HEIGHT],
		[(right + halfRoom) / 2, ROOM_HEIGHT / 2, halfRoom - right, ROOM_HEIGHT],
		[WINDOW.x, bottom / 2, WINDOW.width, bottom],
		[WINDOW.x, (top + ROOM_HEIGHT) / 2, WINDOW.width, ROOM_HEIGHT - top],
	];

	return (
		<group>
			{blocks.map(([x, y, w, h], i) => (
				<mesh key={i} position={[x, y, BACK_WALL_Z - WALL_THICKNESS / 2]} castShadow receiveShadow>
					<boxGeometry args={[w, h, WALL_THICKNESS]} />
					<meshStandardMaterial map={wallTexture} color="#ffffff" roughness={0.95} />
				</mesh>
			))}
		</group>
	);
}

/** Window frame, half-open venetian blinds, and the dusk sky behind. */
function SunsetWindow({ skyTexture }) {
	const slats = useMemo(() => Array.from({ length: 9 }, (_, i) => WINDOW.y + WINDOW.height / 2 - 0.04 - i * 0.055), []);
	const frameColor = "#e6dcc6";

	return (
		<group>
			{/* sky far behind the glass, unlit so it glows */}
			<mesh position={[WINDOW.x + 0.3, WINDOW.y - 0.1, BACK_WALL_Z - 2.2]}>
				<planeGeometry args={[5, 4]} />
				<meshBasicMaterial map={skyTexture} toneMapped={false} fog={false} />
			</mesh>

			{/* frame */}
			{[
				[WINDOW.x, WINDOW.y + WINDOW.height / 2, WINDOW.width + 0.08, 0.05],
				[WINDOW.x, WINDOW.y - WINDOW.height / 2, WINDOW.width + 0.16, 0.06],
				[WINDOW.x - WINDOW.width / 2, WINDOW.y, 0.05, WINDOW.height],
				[WINDOW.x + WINDOW.width / 2, WINDOW.y, 0.05, WINDOW.height],
				[WINDOW.x, WINDOW.y, 0.03, WINDOW.height],
			].map(([x, y, w, h], i) => (
				<mesh key={i} position={[x, y, BACK_WALL_Z + 0.01]} castShadow>
					<boxGeometry args={[w, h, i === 1 ? 0.14 : 0.06]} />
					<meshStandardMaterial color={frameColor} roughness={0.6} />
				</mesh>
			))}

			{/* blinds — tilted slats cast striped light onto the desk */}
			{slats.map((y, i) => (
				<mesh key={i} position={[WINDOW.x, y, BACK_WALL_Z + 0.06]} rotation={[0.9, 0, 0]} castShadow>
					<boxGeometry args={[WINDOW.width - 0.04, 0.045, 0.004]} />
					<meshStandardMaterial color="#efe4cf" roughness={0.7} />
				</mesh>
			))}
			<mesh position={[WINDOW.x, WINDOW.y + WINDOW.height / 2 - 0.01, BACK_WALL_Z + 0.06]} castShadow>
				<boxGeometry args={[WINDOW.width, 0.03, 0.05]} />
				<meshStandardMaterial color="#efe4cf" roughness={0.7} />
			</mesh>
		</group>
	);
}

function Desk() {
	const wood = "#9a6b45";
	const legs = [
		[-0.8, -0.38],
		[0.8, -0.38],
		[-0.8, 0.36],
		[0.8, 0.36],
	];
	return (
		<group position={[0, 0, -0.75]}>
			<mesh position={[0, DESK_TOP_Y - 0.02, 0]} castShadow receiveShadow>
				<boxGeometry args={[1.72, 0.04, 0.8]} />
				<meshStandardMaterial color={wood} roughness={0.55} />
			</mesh>
			{legs.map(([x, z], i) => (
				<mesh key={i} position={[x, (DESK_TOP_Y - 0.04) / 2, z]} castShadow receiveShadow>
					<boxGeometry args={[0.05, DESK_TOP_Y - 0.04, 0.05]} />
					<meshStandardMaterial color="#5e3f2a" roughness={0.7} />
				</mesh>
			))}
			{/* drawer unit */}
			<mesh position={[0.62, 0.38, 0]} castShadow receiveShadow>
				<boxGeometry args={[0.4, 0.68, 0.72]} />
				<meshStandardMaterial color="#8a5e3c" roughness={0.6} />
			</mesh>
			{[0.55, 0.32, 0.12].map((y, i) => (
				<mesh key={i} position={[0.62, y, 0.362]}>
					<boxGeometry args={[0.1, 0.015, 0.01]} />
					<meshStandardMaterial color="#e6dcc6" metalness={0.4} roughness={0.4} />
				</mesh>
			))}
		</group>
	);
}

/** Lava lamp with slowly rising blobs and its own warm light. */
function LavaLamp(props) {
	const blobs = useRef([]);
	const lightRef = useRef();
	const seeds = useMemo(() => [0, 1.7, 3.1, 4.6].map((offset, i) => ({ offset, speed: 0.18 + i * 0.05, size: 0.022 + (i % 2) * 0.008 })), []);

	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		seeds.forEach((seed, i) => {
			const blob = blobs.current[i];
			if (!blob) return;
			const phase = (Math.sin(t * seed.speed + seed.offset) + 1) / 2;
			blob.position.y = 0.09 + phase * 0.2;
			blob.position.x = Math.sin(t * 0.3 + seed.offset) * 0.012;
			const stretch = 1 + Math.sin(t * 0.7 + seed.offset) * 0.25;
			blob.scale.set(1, stretch, 1);
		});
		if (lightRef.current) lightRef.current.intensity = 0.22 + Math.sin(t * 1.3) * 0.04;
	});

	return (
		<group {...props}>
			<mesh position={[0, 0.04, 0]} castShadow>
				<cylinderGeometry args={[0.035, 0.06, 0.08, 20]} />
				<meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.25} />
			</mesh>
			<mesh position={[0, 0.2, 0]}>
				<cylinderGeometry args={[0.03, 0.05, 0.24, 20, 1, true]} />
				<meshStandardMaterial color="#ff2e88" emissive="#ff2e88" emissiveIntensity={0.35} transparent opacity={0.45} roughness={0.1} />
			</mesh>
			<mesh position={[0, 0.35, 0]} castShadow>
				<cylinderGeometry args={[0.012, 0.03, 0.06, 20]} />
				<meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.25} />
			</mesh>
			{seeds.map((seed, i) => (
				<mesh key={i} ref={(el) => (blobs.current[i] = el)}>
					<sphereGeometry args={[seed.size, 16, 12]} />
					<meshStandardMaterial color="#ffb627" emissive="#ff7a1a" emissiveIntensity={1.6} />
				</mesh>
			))}
			<pointLight ref={lightRef} position={[0, 0.22, 0.05]} color="#ff6a7a" intensity={0.22} distance={0.9} decay={2} />
		</group>
	);
}

/** Low bookshelf with books and a boombox on top. */
function Shelf(props) {
	const books = useMemo(() => {
		const colors = ["#e8352b", "#2b1233", "#ffb627", "#2ec4b6", "#ff7a1a", "#5a2a3e", "#ff2e88", "#e6dcc6"];
		let x = -0.27;
		return Array.from({ length: 11 }, (_, i) => {
			const w = 0.03 + Math.random() * 0.025;
			const h = 0.2 + Math.random() * 0.08;
			const book = { x: x + w / 2, w, h, color: colors[i % colors.length] };
			x += w + 0.004;
			return book;
		});
	}, []);

	return (
		<group {...props}>
			<mesh position={[0, 0.45, 0]} castShadow receiveShadow>
				<boxGeometry args={[0.64, 0.9, 0.32]} />
				<meshStandardMaterial color="#6e4a33" roughness={0.7} />
			</mesh>
			{/* hollow front: dark inner panel */}
			<mesh position={[0, 0.45, 0.161]}>
				<planeGeometry args={[0.58, 0.84]} />
				<meshStandardMaterial color="#2a1a14" roughness={0.9} />
			</mesh>
			<mesh position={[0, 0.45, 0.14]} castShadow>
				<boxGeometry args={[0.58, 0.02, 0.05]} />
				<meshStandardMaterial color="#6e4a33" roughness={0.7} />
			</mesh>
			{books.map((book, i) => (
				<mesh key={i} position={[book.x, 0.47 + book.h / 2, 0.08]} castShadow>
					<boxGeometry args={[book.w, book.h, 0.18]} />
					<meshStandardMaterial color={book.color} roughness={0.8} />
				</mesh>
			))}

			{/* boombox */}
			<group position={[0, 0.98, 0]}>
				<mesh castShadow>
					<boxGeometry args={[0.46, 0.16, 0.13]} />
					<meshStandardMaterial color="#2a2428" roughness={0.5} metalness={0.3} />
				</mesh>
				{[-0.15, 0.15].map((x) => (
					<mesh key={x} position={[x, -0.005, 0.066]} rotation={[Math.PI / 2, 0, 0]}>
						<cylinderGeometry args={[0.055, 0.055, 0.006, 24]} />
						<meshStandardMaterial color="#141014" roughness={0.9} />
					</mesh>
				))}
				<mesh position={[0, 0.02, 0.066]}>
					<boxGeometry args={[0.12, 0.06, 0.006]} />
					<meshStandardMaterial color="#5a4a4a" roughness={0.4} />
				</mesh>
				<mesh position={[0, 0.098, 0]}>
					<boxGeometry args={[0.36, 0.02, 0.02]} />
					<meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.3} />
				</mesh>
			</group>
		</group>
	);
}

function FloppyStack(props) {
	const colors = ["#2b1233", "#e8352b", "#ffb627", "#2ec4b6", "#ff7a1a"];
	return (
		<group {...props}>
			{colors.map((color, i) => (
				<mesh key={color} position={[Math.sin(i * 1.7) * 0.006, 0.0035 + i * 0.0072, 0]} rotation={[0, i * 0.12, 0]} castShadow>
					<boxGeometry args={[0.09, 0.0065, 0.094]} />
					<meshStandardMaterial color={color} roughness={0.5} />
				</mesh>
			))}
		</group>
	);
}

function RoomScene({ powerState, isDriveActive, anchorRef, onSitDown, onPowerButton }) {
	const textures = useMemo(
		() => ({
			sky: createSkyTexture(),
			poster: createPosterTexture(),
			floor: createFloorTexture(),
			rug: createRugTexture(),
			wall: createWallTexture(),
		}),
		[]
	);

	// Sun comes in low through the window and lands on the desk.
	const sunPosition = [-3.8, 3.7, -2.8];
	const sunTarget = useMemo(() => {
		const target = { position: [-0.1, 0.76, -0.57] };
		return target;
	}, []);
	const sunRef = useRef();
	const targetRef = useRef();

	useFrame(() => {
		if (sunRef.current && targetRef.current && sunRef.current.target !== targetRef.current) {
			sunRef.current.target = targetRef.current;
		}
	});

	return (
		<group>
			{/* ─── lighting ─── */}
			<hemisphereLight args={["#b06a8e", "#2a1418", 1.1]} />
			<ambientLight color="#5a3048" intensity={0.5} />
			<directionalLight
				ref={sunRef}
				position={sunPosition}
				color="#ff9a4a"
				intensity={6}
				castShadow
				shadow-mapSize={[2048, 2048]}
				shadow-bias={-0.0004}
				shadow-normalBias={0.02}
				shadow-camera-left={-2}
				shadow-camera-right={2}
				shadow-camera-top={2}
				shadow-camera-bottom={-2}
				shadow-camera-near={0.5}
				shadow-camera-far={9}
			/>
			<object3D ref={targetRef} position={sunTarget.position} />
			{/* soft fill so the room is not pitch black away from the window */}
			<pointLight position={[0.6, 2.4, 0.6]} color="#ffc9a0" intensity={4} distance={7} decay={2} />
			<pointLight position={[-1.6, 1.4, 0.4]} color="#ff8a5a" intensity={1.6} distance={4} decay={2} />

			{/* ─── room shell ─── */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.6]} receiveShadow>
				<planeGeometry args={[ROOM_WIDTH, 3.6]} />
				<meshStandardMaterial map={textures.floor} roughness={0.75} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.004, 0.15]} receiveShadow>
				<circleGeometry args={[0.95, 48]} />
				<meshStandardMaterial map={textures.rug} roughness={1} />
			</mesh>
			<BackWall wallTexture={textures.wall} />
			{/* side walls */}
			{[-1, 1].map((side) => (
				<mesh key={side} position={[side * (ROOM_WIDTH / 2), ROOM_HEIGHT / 2, 0.6]} rotation={[0, -side * (Math.PI / 2), 0]} receiveShadow>
					<planeGeometry args={[3.6, ROOM_HEIGHT]} />
					<meshStandardMaterial map={textures.wall} roughness={0.95} />
				</mesh>
			))}
			<mesh position={[0, ROOM_HEIGHT, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[ROOM_WIDTH, 3.6]} />
				<meshStandardMaterial color="#2a1626" roughness={1} />
			</mesh>
			{/* skirting board */}
			<mesh position={[0, 0.05, BACK_WALL_Z + 0.01]}>
				<boxGeometry args={[ROOM_WIDTH, 0.1, 0.02]} />
				<meshStandardMaterial color="#e6dcc6" roughness={0.6} />
			</mesh>

			<SunsetWindow skyTexture={textures.sky} />

			{/* poster */}
			<mesh position={[0.95, 1.72, BACK_WALL_Z + 0.006]}>
				<planeGeometry args={[0.56, 0.79]} />
				<meshStandardMaterial map={textures.poster} roughness={0.8} />
			</mesh>

			{/* ─── furniture ─── */}
			<Desk />
			<RetroPC position={[-0.05, DESK_TOP_Y, -0.86]} powerState={powerState} isDriveActive={isDriveActive} anchorRef={anchorRef} onSitDown={onSitDown} onPowerButton={onPowerButton} />
			<LavaLamp position={[0.6, DESK_TOP_Y, -0.98]} />
			<FloppyStack position={[-0.6, DESK_TOP_Y, -0.62]} rotation={[0, 0.3, 0]} />
			<Shelf position={[1.65, 0, -0.98]} />
		</group>
	);
}

export default RoomScene;
