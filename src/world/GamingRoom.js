import { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Object3D } from "three";

import RetroPC from "./RetroPC";
import { createDeskMatTexture, createFloorTexture, createNeonSignTexture, createNightSkyTexture, createRainTexture, createRugTexture, createWallTexture } from "./textures";
import userConfig from "../userConfig";

// ─── Layout (metres) ───
const ROOM_WIDTH = 5;
const ROOM_DEPTH = 3.8;
const ROOM_HEIGHT = 2.7;
const BACK_WALL_Z = -1.3;
export const DESK_TOP_Y = 0.75;

const WINDOW = { x: -1.75, y: 1.5, width: 0.9, height: 1.0 };

// Wide 16:9 monitor glass. The host screen (1280×720) is projected onto exactly this.
export const MONITOR_SCREEN_WIDTH = 0.72;
export const MONITOR_SCREEN_HEIGHT = 0.405;

const HOST_NAME = (userConfig.copyright || "RETRO").replace(/©/g, "").trim().toUpperCase();

/** "high" or "low" — provided inside the Canvas by Room3D. */
export const QualityContext = createContext("high");

/** Accent lights that sell the RGB look but cost a lot; skipped in low-power mode. */
function DecorLight(props) {
	const quality = useContext(QualityContext);
	return quality === "low" ? null : <pointLight {...props} />;
}

function setCursor(value) {
	document.body.style.cursor = value;
}

function hoverable(label, onHoverLabel, onClick) {
	return {
		onClick: (event) => {
			event.stopPropagation();
			onClick?.();
		},
		onPointerOver: (event) => {
			event.stopPropagation();
			setCursor("pointer");
			onHoverLabel?.(label);
		},
		onPointerOut: () => {
			setCursor("auto");
			onHoverLabel?.(null);
		},
	};
}

/** Emissive material values that push past 1.0 so the bloom pass picks them up. */
function Glow({ color, intensity = 3 }) {
	return <meshStandardMaterial color="#000000" emissive={color} emissiveIntensity={intensity} toneMapped={false} />;
}

// ─────────────────────────────── Room shell ───────────────────────────────

function BackWall({ texture }) {
	const left = WINDOW.x - WINDOW.width / 2;
	const right = WINDOW.x + WINDOW.width / 2;
	const bottom = WINDOW.y - WINDOW.height / 2;
	const top = WINDOW.y + WINDOW.height / 2;
	const half = ROOM_WIDTH / 2;
	const blocks = [
		[(-half + left) / 2, ROOM_HEIGHT / 2, left + half, ROOM_HEIGHT],
		[(right + half) / 2, ROOM_HEIGHT / 2, half - right, ROOM_HEIGHT],
		[WINDOW.x, bottom / 2, WINDOW.width, bottom],
		[WINDOW.x, (top + ROOM_HEIGHT) / 2, WINDOW.width, ROOM_HEIGHT - top],
	];
	return blocks.map(([x, y, w, h], i) => (
		<mesh key={i} position={[x, y, BACK_WALL_Z - 0.05]} castShadow receiveShadow>
			<boxGeometry args={[w, h, 0.1]} />
			<meshStandardMaterial map={texture} roughness={0.95} />
		</mesh>
	));
}

function RainyWindow({ skyTexture, rainTexture }) {
	useFrame((_, delta) => {
		rainTexture.offset.y += delta * 0.35;
	});
	return (
		<group>
			{/* wide backdrop: the room camera looks through the window at a steep angle */}
			<mesh position={[WINDOW.x - 2.2, WINDOW.y + 0.2, BACK_WALL_Z - 2.4]}>
				<planeGeometry args={[10, 5]} />
				<meshBasicMaterial map={skyTexture} toneMapped={false} fog={false} />
			</mesh>
			{/* rain streaks on the glass */}
			<mesh position={[WINDOW.x, WINDOW.y, BACK_WALL_Z - 0.02]}>
				<planeGeometry args={[WINDOW.width, WINDOW.height]} />
				<meshBasicMaterial map={rainTexture} transparent opacity={0.35} depthWrite={false} />
			</mesh>
			{/* slim black frame */}
			{[
				[WINDOW.x, WINDOW.y + WINDOW.height / 2, WINDOW.width + 0.04, 0.03],
				[WINDOW.x, WINDOW.y - WINDOW.height / 2, WINDOW.width + 0.1, 0.04],
				[WINDOW.x - WINDOW.width / 2, WINDOW.y, 0.03, WINDOW.height],
				[WINDOW.x + WINDOW.width / 2, WINDOW.y, 0.03, WINDOW.height],
				[WINDOW.x, WINDOW.y, WINDOW.width, 0.02],
			].map(([x, y, w, h], i) => (
				<mesh key={i} position={[x, y, BACK_WALL_Z + 0.01]} castShadow>
					<boxGeometry args={[w, h, i === 1 ? 0.12 : 0.05]} />
					<meshStandardMaterial color="#111014" roughness={0.4} metalness={0.4} />
				</mesh>
			))}
		</group>
	);
}

function LedStrip({ position, length, color, rotation }) {
	return (
		<mesh position={position} rotation={rotation}>
			<boxGeometry args={[length, 0.012, 0.012]} />
			<Glow color={color} intensity={4} />
		</mesh>
	);
}

// ─────────────────────────────── Wall decor ───────────────────────────────

function NeonSign({ palette, onHoverLabel, onCyclePalette, ...props }) {
	const texture = useMemo(() => createNeonSignTexture(HOST_NAME, palette[0]), [palette]);
	const tint = useMemo(() => new Color(1.5, 1.5, 1.5), []);
	return (
		<group {...props}>
			<mesh {...hoverable("Change the RGB lighting", onHoverLabel, onCyclePalette)}>
				<planeGeometry args={[0.78, 0.195]} />
				<meshBasicMaterial map={texture} color={tint} transparent toneMapped={false} depthWrite={false} />
			</mesh>
			<DecorLight position={[0, 0, 0.25]} color={palette[0]} intensity={1.6} distance={2} decay={2} />
		</group>
	);
}

/** Honeycomb light panels with a slow colour wave. */
function HexPanels({ palette, onHoverLabel, onCyclePalette, ...props }) {
	const cells = useMemo(() => {
		const r = 0.1;
		const w = r * Math.sqrt(3);
		return [
			[0, 0],
			[w, 0],
			[-w, 0],
			[w / 2, r * 1.5],
			[-w / 2, r * 1.5],
			[w / 2, -r * 1.5],
			[w * 1.5, -r * 1.5],
		];
	}, []);
	const materials = useRef([]);
	const colors = useMemo(() => palette.map((c) => new Color(c)), [palette]);
	const mixed = useMemo(() => new Color(), []);

	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		materials.current.forEach((material, i) => {
			if (!material) return;
			const phase = (Math.sin(t * 0.8 - i * 0.7) + 1) / 2;
			mixed.copy(colors[i % colors.length]).lerp(colors[(i + 1) % colors.length], phase);
			material.emissive.copy(mixed);
			material.emissiveIntensity = 1.1 + phase * 0.9;
		});
	});

	return (
		<group {...props} {...hoverable("Change the RGB lighting", onHoverLabel, onCyclePalette)}>
			{cells.map(([x, y], i) => (
				<mesh key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
					<cylinderGeometry args={[0.094, 0.094, 0.02, 6]} />
					<meshStandardMaterial ref={(m) => (materials.current[i] = m)} color="#000" emissive={palette[0]} emissiveIntensity={2} toneMapped={false} />
				</mesh>
			))}
			<DecorLight position={[0, 0, 0.3]} color={palette[1]} intensity={1.4} distance={1.8} decay={2} />
		</group>
	);
}

// ─────────────────────────────── Desk & PC ───────────────────────────────

function Desk({ matTexture, palette }) {
	return (
		<group position={[0, 0, -0.95]}>
			<mesh position={[0, DESK_TOP_Y - 0.02, 0]} castShadow receiveShadow>
				<boxGeometry args={[1.8, 0.04, 0.7]} />
				<meshStandardMaterial color="#141216" roughness={0.45} metalness={0.2} />
			</mesh>
			{/* angled steel legs */}
			{[-0.82, 0.82].map((x) => (
				<group key={x} position={[x, 0, 0]}>
					<mesh position={[0, (DESK_TOP_Y - 0.04) / 2, 0]} castShadow>
						<boxGeometry args={[0.05, DESK_TOP_Y - 0.04, 0.05]} />
						<meshStandardMaterial color="#1c1a20" metalness={0.6} roughness={0.35} />
					</mesh>
					<mesh position={[0, 0.02, 0]} castShadow>
						<boxGeometry args={[0.07, 0.04, 0.62]} />
						<meshStandardMaterial color="#1c1a20" metalness={0.6} roughness={0.35} />
					</mesh>
				</group>
			))}
			{/* desk mat */}
			<mesh position={[0.08, DESK_TOP_Y + 0.002, 0.14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[0.95, 0.4]} />
				<meshStandardMaterial map={matTexture} roughness={0.95} />
			</mesh>
			{/* LED strip under the back edge washes the wall */}
			<LedStrip position={[0, DESK_TOP_Y - 0.045, -0.34]} length={1.7} color={palette[1]} />
			<DecorLight position={[0, DESK_TOP_Y - 0.1, -0.4]} color={palette[1]} intensity={1.5} distance={1.6} decay={2} />
		</group>
	);
}

/** Thin-bezel 16:9 monitor on a stand; the host screen is pinned to `anchorRef`. */
function WideMonitor({ anchorRef, isOn, palette, onHoverLabel, onSitDown, ...props }) {
	return (
		<group {...props}>
			<group {...hoverable("Sit down at the PC", onHoverLabel, onSitDown)}>
				{/* panel */}
				<mesh castShadow>
					<boxGeometry args={[MONITOR_SCREEN_WIDTH + 0.02, MONITOR_SCREEN_HEIGHT + 0.03, 0.025]} />
					<meshStandardMaterial color="#0c0b0e" roughness={0.35} metalness={0.4} />
				</mesh>
				{/* chin with tiny logo light */}
				<mesh position={[0, -MONITOR_SCREEN_HEIGHT / 2 - 0.005, 0.0128]}>
					<planeGeometry args={[0.03, 0.004]} />
					<Glow color={isOn ? palette[0] : "#331a22"} intensity={isOn ? 2 : 0.3} />
				</mesh>
				{/* glass (the live host screen is drawn over it) */}
				<mesh position={[0, 0.005, 0.0128]}>
					<planeGeometry args={[MONITOR_SCREEN_WIDTH, MONITOR_SCREEN_HEIGHT]} />
					<meshStandardMaterial color="#030204" roughness={0.15} metalness={0.2} />
				</mesh>
				{/* rear housing */}
				<mesh position={[0, -0.02, -0.035]} castShadow>
					<boxGeometry args={[0.4, 0.24, 0.05]} />
					<meshStandardMaterial color="#121115" roughness={0.5} />
				</mesh>
				{/* rear RGB ring */}
				<mesh position={[0, -0.02, -0.061]}>
					<torusGeometry args={[0.08, 0.006, 8, 40]} />
					<Glow color={palette[0]} intensity={isOn ? 4 : 1.2} />
				</mesh>
			</group>
			<group ref={anchorRef} position={[0, 0.005, 0.0135]} />
			{/* stand */}
			<mesh position={[0, -0.2, -0.06]} castShadow>
				<boxGeometry args={[0.05, 0.22, 0.03]} />
				<meshStandardMaterial color="#1c1a20" metalness={0.6} roughness={0.3} />
			</mesh>
			<mesh position={[0, -0.32, -0.02]} castShadow>
				<boxGeometry args={[0.26, 0.012, 0.18]} />
				<meshStandardMaterial color="#1c1a20" metalness={0.6} roughness={0.3} />
			</mesh>
			{/* bias lighting on the wall behind */}
			<pointLight position={[0, 0, -0.18]} color={palette[0]} intensity={isOn ? 2.2 : 0.8} distance={1.4} decay={2} />
			{/* screen light falling on the desk */}
			<pointLight position={[0, -0.05, 0.35]} color="#ffd0b0" intensity={isOn ? 1.3 : 0} distance={1.8} decay={2} />
		</group>
	);
}

function Fan({ color, spinRef, ...props }) {
	return (
		<group {...props}>
			<mesh>
				<torusGeometry args={[0.052, 0.006, 8, 32]} />
				<Glow color={color} intensity={3.2} />
			</mesh>
			<group ref={spinRef}>
				{[0, 1, 2].map((i) => (
					<mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]} position={[0, 0, 0]}>
						<boxGeometry args={[0.085, 0.018, 0.003]} />
						<meshStandardMaterial color="#1a171d" roughness={0.6} />
					</mesh>
				))}
			</group>
		</group>
	);
}

/** Glass-side tower: front intake fans, GPU, RAM and CPU cooler all lit. */
function GamingTower({ palette, isOn, ...props }) {
	const fanRefs = useRef([]);
	useFrame((_, delta) => {
		const speed = isOn ? 14 : 2.5;
		fanRefs.current.forEach((fan) => fan && (fan.rotation.z += delta * speed));
	});

	const W = 0.22;
	const H = 0.46;
	const D = 0.44;
	return (
		<group {...props}>
			{/* chassis (open on the +X side for the glass) */}
			<mesh position={[-0.004, 0, 0]} castShadow receiveShadow>
				<boxGeometry args={[W - 0.008, H, D]} />
				<meshStandardMaterial color="#0f0e12" roughness={0.4} metalness={0.5} />
			</mesh>
			{/* interior back panel seen through the glass */}
			<mesh position={[W / 2 - 0.012, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
				<planeGeometry args={[D - 0.02, H - 0.02]} />
				<meshStandardMaterial color="#09080b" roughness={0.9} />
			</mesh>
			{/* GPU */}
			<mesh position={[W / 2 - 0.05, -0.04, -0.01]} castShadow>
				<boxGeometry args={[0.06, 0.05, 0.3]} />
				<meshStandardMaterial color="#1a181e" roughness={0.4} metalness={0.5} />
			</mesh>
			<mesh position={[W / 2 - 0.019, -0.04, -0.01]} rotation={[0, Math.PI / 2, 0]}>
				<planeGeometry args={[0.26, 0.008]} />
				<Glow color={palette[1]} intensity={4} />
			</mesh>
			{/* RAM sticks */}
			{[0, 1, 2, 3].map((i) => (
				<mesh key={i} position={[W / 2 - 0.03, 0.11, -0.02 - i * 0.018]}>
					<boxGeometry args={[0.012, 0.07, 0.006]} />
					<Glow color={palette[i % 3]} intensity={3} />
				</mesh>
			))}
			{/* CPU cooler ring */}
			<mesh position={[W / 2 - 0.03, 0.1, 0.08]} rotation={[0, Math.PI / 2, 0]}>
				<torusGeometry args={[0.035, 0.005, 8, 28]} />
				<Glow color={palette[2]} intensity={3.5} />
			</mesh>
			{/* tempered glass */}
			<mesh position={[W / 2 - 0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
				<planeGeometry args={[D, H]} />
				<meshStandardMaterial color="#20202a" transparent opacity={0.18} roughness={0.05} metalness={0.6} depthWrite={false} />
			</mesh>
			{/* front intake fans */}
			{[0.13, 0, -0.13].map((y, i) => (
				<Fan key={y} position={[0, y, D / 2 + 0.002]} color={palette[i % 3]} spinRef={(el) => (fanRefs.current[i] = el)} />
			))}
			{/* power button */}
			<mesh position={[0.07, H / 2 + 0.001, D / 2 - 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
				<circleGeometry args={[0.008, 20]} />
				<Glow color={isOn ? "#2ec4b6" : "#203030"} intensity={isOn ? 3 : 0.2} />
			</mesh>
			<DecorLight position={[W / 2 + 0.15, 0, 0]} color={palette[2]} intensity={1.2} distance={1.2} decay={2} />
		</group>
	);
}

function RgbKeyboard({ palette, ...props }) {
	const keysRef = useRef();
	const columns = 17;
	const rows = 6;
	useLayoutEffect(() => {
		const dummy = new Object3D();
		let i = 0;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < columns; col++) {
				dummy.position.set(-0.208 + col * 0.026, 0.017, -0.062 + row * 0.024);
				dummy.updateMatrix();
				keysRef.current.setMatrixAt(i++, dummy.matrix);
			}
		}
		keysRef.current.instanceMatrix.needsUpdate = true;
	}, []);

	return (
		<group {...props}>
			<mesh castShadow receiveShadow>
				<boxGeometry args={[0.47, 0.02, 0.16]} />
				<meshStandardMaterial color="#121116" roughness={0.4} metalness={0.4} />
			</mesh>
			{/* underglow plate between the keys */}
			<mesh position={[0, 0.0105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[0.45, 0.145]} />
				<Glow color={palette[0]} intensity={2.4} />
			</mesh>
			<instancedMesh ref={keysRef} args={[null, null, columns * rows]} castShadow>
				<boxGeometry args={[0.022, 0.012, 0.02]} />
				<meshStandardMaterial color="#1b1a20" roughness={0.6} />
			</instancedMesh>
		</group>
	);
}

function GamingMouse({ palette, ...props }) {
	return (
		<group {...props}>
			<mesh castShadow scale={[1, 0.55, 1.5]}>
				<sphereGeometry args={[0.032, 20, 14]} />
				<meshStandardMaterial color="#141317" roughness={0.35} metalness={0.3} />
			</mesh>
			<mesh position={[0, 0.002, 0.04]}>
				<boxGeometry args={[0.03, 0.006, 0.004]} />
				<Glow color={palette[1]} intensity={3} />
			</mesh>
		</group>
	);
}

function Speaker({ palette, ...props }) {
	return (
		<group {...props}>
			<mesh castShadow>
				<boxGeometry args={[0.09, 0.17, 0.1]} />
				<meshStandardMaterial color="#141217" roughness={0.5} />
			</mesh>
			<mesh position={[0, -0.02, 0.051]}>
				<circleGeometry args={[0.03, 24]} />
				<meshStandardMaterial color="#060507" roughness={0.9} />
			</mesh>
			<mesh position={[0, -0.02, 0.052]}>
				<ringGeometry args={[0.03, 0.034, 32]} />
				<Glow color={palette[2]} intensity={2.4} />
			</mesh>
		</group>
	);
}

function HeadsetStand({ palette, ...props }) {
	return (
		<group {...props}>
			<mesh position={[0, 0.005, 0]} castShadow>
				<cylinderGeometry args={[0.06, 0.065, 0.01, 24]} />
				<meshStandardMaterial color="#141217" metalness={0.5} roughness={0.3} />
			</mesh>
			<mesh position={[0, 0.005, 0]}>
				<torusGeometry args={[0.063, 0.003, 6, 40]} />
				<Glow color={palette[0]} intensity={3} />
			</mesh>
			<mesh position={[0, 0.14, 0]} castShadow>
				<cylinderGeometry args={[0.008, 0.008, 0.27, 12]} />
				<meshStandardMaterial color="#1c1a20" metalness={0.6} roughness={0.3} />
			</mesh>
			{/* headset */}
			<group position={[0, 0.27, 0]}>
				<mesh rotation={[0, 0, 0]}>
					<torusGeometry args={[0.075, 0.012, 10, 30, Math.PI]} />
					<meshStandardMaterial color="#141217" roughness={0.5} />
				</mesh>
				{[-1, 1].map((side) => (
					<group key={side} position={[side * 0.078, -0.03, 0]}>
						<mesh rotation={[0, 0, Math.PI / 2]} castShadow>
							<cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
							<meshStandardMaterial color="#1a181e" roughness={0.6} />
						</mesh>
						<mesh position={[side * 0.016, 0, 0]} rotation={[0, (side * Math.PI) / 2, 0]}>
							<ringGeometry args={[0.03, 0.036, 28]} />
							<Glow color={palette[1]} intensity={3} />
						</mesh>
					</group>
				))}
			</group>
		</group>
	);
}

function GamingChair({ palette, ...props }) {
	const accent = palette[0];
	return (
		<group {...props}>
			{/* star base */}
			{[0, 1, 2, 3, 4].map((i) => (
				<mesh key={i} position={[Math.cos((i * Math.PI * 2) / 5) * 0.16, 0.05, Math.sin((i * Math.PI * 2) / 5) * 0.16]} rotation={[0, (-i * Math.PI * 2) / 5, 0]} castShadow>
					<boxGeometry args={[0.32, 0.03, 0.04]} />
					<meshStandardMaterial color="#141217" metalness={0.5} roughness={0.35} />
				</mesh>
			))}
			<mesh position={[0, 0.25, 0]} castShadow>
				<cylinderGeometry args={[0.025, 0.03, 0.38, 12]} />
				<meshStandardMaterial color="#2a2830" metalness={0.8} roughness={0.25} />
			</mesh>
			{/* seat */}
			<mesh position={[0, 0.47, 0]} castShadow receiveShadow>
				<boxGeometry args={[0.5, 0.09, 0.48]} />
				<meshStandardMaterial color="#151318" roughness={0.7} />
			</mesh>
			{/* backrest */}
			<mesh position={[0, 0.83, -0.23]} rotation={[-0.12, 0, 0]} castShadow>
				<boxGeometry args={[0.46, 0.66, 0.08]} />
				<meshStandardMaterial color="#151318" roughness={0.7} />
			</mesh>
			{/* accent stripes */}
			{[-0.15, 0.15].map((x) => (
				<mesh key={x} position={[x, 0.83, -0.186]} rotation={[-0.12, 0, 0]}>
					<boxGeometry args={[0.04, 0.6, 0.005]} />
					<meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.6} />
				</mesh>
			))}
			{/* armrests */}
			{[-0.27, 0.27].map((x) => (
				<mesh key={x} position={[x, 0.62, 0]} castShadow>
					<boxGeometry args={[0.05, 0.03, 0.3]} />
					<meshStandardMaterial color="#141217" roughness={0.5} />
				</mesh>
			))}
		</group>
	);
}

// ─────────────────────────────── Shelf of retro collectibles ───────────────────────────────

function CollectiblesShelf({ palette, onHoverLabel, onOpenClassic, ...props }) {
	const cartridges = ["#2b1233", "#e8352b", "#ffb627", "#2ec4b6", "#ff7a1a"];
	return (
		<group {...props}>
			<mesh castShadow receiveShadow>
				<boxGeometry args={[0.8, 0.03, 0.24]} />
				<meshStandardMaterial color="#1a1720" roughness={0.5} metalness={0.3} />
			</mesh>
			<LedStrip position={[0, -0.02, 0.1]} length={0.76} color={palette[2]} />
			<DecorLight position={[0, -0.12, 0.15]} color={palette[2]} intensity={0.8} distance={1} decay={2} />

			{/* the old beige PC, kept as a display piece — click it for Classic mode */}
			<group position={[-0.2, 0.015, 0]} scale={0.34} {...hoverable("Boot the original 90s PC (Classic mode)", onHoverLabel, onOpenClassic)}>
				<RetroPC powerState="on" isDriveActive={false} showPeripherals={false} onSitDown={onOpenClassic} onPowerButton={onOpenClassic} />
			</group>

			{/* game cartridges */}
			{cartridges.map((color, i) => (
				<mesh key={color} position={[0.06 + i * 0.03, 0.065, 0.02]} rotation={[0, 0, (i - 2) * 0.04]} castShadow>
					<boxGeometry args={[0.022, 0.1, 0.11]} />
					<meshStandardMaterial color={color} roughness={0.5} />
				</mesh>
			))}
			{/* cassette */}
			<group position={[0.3, 0.03, 0.02]} rotation={[0, -0.4, 0]}>
				<mesh castShadow>
					<boxGeometry args={[0.1, 0.03, 0.065]} />
					<meshStandardMaterial color="#e6dcc6" roughness={0.5} />
				</mesh>
				<mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[0.08, 0.035]} />
					<meshStandardMaterial color="#ff7a1a" roughness={0.6} />
				</mesh>
			</group>
		</group>
	);
}

/** Lava lamp: slow rising blobs, the one analogue glow in the room. */
function LavaLamp(props) {
	const blobs = useRef([]);
	const seeds = useMemo(() => [0, 1.7, 3.1, 4.6].map((offset, i) => ({ offset, speed: 0.18 + i * 0.05, size: 0.018 + (i % 2) * 0.007 })), []);
	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		seeds.forEach((seed, i) => {
			const blob = blobs.current[i];
			if (!blob) return;
			blob.position.y = 0.08 + ((Math.sin(t * seed.speed + seed.offset) + 1) / 2) * 0.17;
			blob.position.x = Math.sin(t * 0.3 + seed.offset) * 0.01;
			blob.scale.set(1, 1 + Math.sin(t * 0.7 + seed.offset) * 0.25, 1);
		});
	});
	return (
		<group {...props}>
			<mesh position={[0, 0.035, 0]} castShadow>
				<cylinderGeometry args={[0.03, 0.05, 0.07, 20]} />
				<meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.25} />
			</mesh>
			<mesh position={[0, 0.17, 0]}>
				<cylinderGeometry args={[0.025, 0.042, 0.2, 20, 1, true]} />
				<meshStandardMaterial color="#ff2e88" emissive="#ff2e88" emissiveIntensity={0.5} transparent opacity={0.4} />
			</mesh>
			{seeds.map((seed, i) => (
				<mesh key={i} ref={(el) => (blobs.current[i] = el)}>
					<sphereGeometry args={[seed.size, 14, 10]} />
					<Glow color="#ff7a1a" intensity={2.2} />
				</mesh>
			))}
		</group>
	);
}

// ─────────────────────────────── Scene ───────────────────────────────

function GamingRoom({ powerState, palette, anchorRef, onSitDown, onOpenClassic, onCyclePalette, onHoverLabel }) {
	const isOn = powerState !== "off";
	const textures = useMemo(
		() => ({
			sky: createNightSkyTexture(),
			rain: createRainTexture(),
			floor: createFloorTexture(),
			rug: createRugTexture(),
			wall: createWallTexture(),
			mat: createDeskMatTexture(HOST_NAME),
		}),
		[]
	);

	const moonRef = useRef();
	const moonTarget = useRef();
	useLayoutEffect(() => {
		if (moonRef.current && moonTarget.current) moonRef.current.target = moonTarget.current;
	}, []);

	return (
		<group>
			{/* ─── lighting: dark room, colour comes from the RGB ─── */}
			<ambientLight color="#2a2040" intensity={0.35} />
			<hemisphereLight args={["#3a3060", "#120c10", 0.5]} />
			<directionalLight
				ref={moonRef}
				position={[-3.2, 3.2, -3.6]}
				color="#8a90ff"
				intensity={1.4}
				castShadow
				shadow-mapSize={[1024, 1024]}
				shadow-bias={-0.0004}
				shadow-normalBias={0.02}
				shadow-camera-left={-2}
				shadow-camera-right={2}
				shadow-camera-top={2}
				shadow-camera-bottom={-2}
				shadow-camera-near={0.5}
				shadow-camera-far={9}
			/>
			<object3D ref={moonTarget} position={[-0.6, 0.5, -0.3]} />
			<pointLight position={[0.4, 2.4, 0.8]} color="#ffb59a" intensity={1.4} distance={6} decay={2} />

			{/* ─── shell ─── */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BACK_WALL_Z + ROOM_DEPTH / 2]} receiveShadow>
				<planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
				<meshStandardMaterial map={textures.floor} roughness={0.55} metalness={0.1} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.05, 0.004, -0.15]} receiveShadow>
				<circleGeometry args={[0.95, 56]} />
				<meshStandardMaterial map={textures.rug} roughness={1} />
			</mesh>
			<BackWall texture={textures.wall} />
			{[-1, 1].map((side) => (
				<mesh key={side} position={[side * (ROOM_WIDTH / 2), ROOM_HEIGHT / 2, BACK_WALL_Z + ROOM_DEPTH / 2]} rotation={[0, -side * (Math.PI / 2), 0]} receiveShadow>
					<planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
					<meshStandardMaterial map={textures.wall} roughness={0.95} />
				</mesh>
			))}
			<mesh position={[0, ROOM_HEIGHT, BACK_WALL_Z + ROOM_DEPTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
				<planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
				<meshStandardMaterial color="#0e0b12" roughness={1} />
			</mesh>
			{/* ceiling cove LED along the back wall */}
			<LedStrip position={[0, ROOM_HEIGHT - 0.04, BACK_WALL_Z + 0.03]} length={ROOM_WIDTH} color={palette[0]} />
			<DecorLight position={[0.3, ROOM_HEIGHT - 0.2, BACK_WALL_Z + 0.3]} color={palette[0]} intensity={1.6} distance={3} decay={2} />

			<RainyWindow skyTexture={textures.sky} rainTexture={textures.rain} />
			<NeonSign position={[0.1, 1.92, BACK_WALL_Z + 0.02]} palette={palette} onHoverLabel={onHoverLabel} onCyclePalette={onCyclePalette} />
			<HexPanels position={[0.98, 1.5, BACK_WALL_Z + 0.02]} scale={0.7} palette={palette} onHoverLabel={onHoverLabel} onCyclePalette={onCyclePalette} />
			<CollectiblesShelf position={[-0.75, 1.48, BACK_WALL_Z + 0.12]} palette={palette} onHoverLabel={onHoverLabel} onOpenClassic={onOpenClassic} />

			{/* ─── desk setup ─── */}
			<Desk matTexture={textures.mat} palette={palette} />
			<WideMonitor position={[0.05, DESK_TOP_Y + 0.335, -1.05]} anchorRef={anchorRef} isOn={isOn} palette={palette} onHoverLabel={onHoverLabel} onSitDown={onSitDown} />
			<GamingTower position={[-0.66, DESK_TOP_Y + 0.23, -1.0]} palette={palette} isOn={isOn} />
			<RgbKeyboard position={[0.02, DESK_TOP_Y + 0.012, -0.78]} rotation={[0.05, 0, 0]} palette={palette} />
			<GamingMouse position={[0.36, DESK_TOP_Y + 0.012, -0.78]} palette={palette} />
			<Speaker position={[-0.4, DESK_TOP_Y + 0.085, -1.08]} rotation={[0, 0.25, 0]} palette={palette} />
			<Speaker position={[0.5, DESK_TOP_Y + 0.085, -1.08]} rotation={[0, -0.25, 0]} palette={palette} />
			<HeadsetStand position={[0.68, DESK_TOP_Y, -0.9]} palette={palette} />
			<LavaLamp position={[-0.36, DESK_TOP_Y, -0.72]} />
			<GamingChair position={[-1.15, 0, -0.45]} rotation={[0, 2.2, 0]} palette={palette} />
		</group>
	);
}

export default GamingRoom;
