import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D } from "three";

// Screen size in metres (4:3). The 800×600 desktop is projected onto exactly this area.
export const SCREEN_WIDTH = 0.36;
export const SCREEN_HEIGHT = 0.27;

const BEIGE = "#d8cbb0";
const BEIGE_DARK = "#b9ac92";
const BEZEL_INNER = "#1c1416";

function setCursor(value) {
	document.body.style.cursor = value;
}

/** Instanced keycaps so the keyboard costs a single draw call. */
function Keyboard(props) {
	const keysRef = useRef();
	const columns = 15;
	const rows = 5;

	useLayoutEffect(() => {
		const dummy = new Object3D();
		let i = 0;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < columns; col++) {
				dummy.position.set(-0.196 + col * 0.028, 0.016, -0.052 + row * 0.026);
				dummy.updateMatrix();
				keysRef.current.setMatrixAt(i++, dummy.matrix);
			}
		}
		keysRef.current.instanceMatrix.needsUpdate = true;
	}, []);

	return (
		<group {...props}>
			<mesh castShadow receiveShadow>
				<boxGeometry args={[0.45, 0.022, 0.16]} />
				<meshStandardMaterial color={BEIGE} roughness={0.7} />
			</mesh>
			<instancedMesh ref={keysRef} args={[null, null, columns * rows]} castShadow>
				<boxGeometry args={[0.024, 0.012, 0.022]} />
				<meshStandardMaterial color="#eae0cc" roughness={0.6} />
			</instancedMesh>
			{/* space bar */}
			<mesh position={[0, 0.016, 0.082]} castShadow>
				<boxGeometry args={[0.16, 0.012, 0.022]} />
				<meshStandardMaterial color="#eae0cc" roughness={0.6} />
			</mesh>
		</group>
	);
}

/**
 * The beige 90s PC. With `showPeripherals={false}` it becomes a compact display
 * piece (no keyboard, mouse or glow light) whose clicks are handled by the parent.
 */
function RetroPC({ powerState, isDriveActive, anchorRef, onSitDown, onPowerButton, showPeripherals = true, ...props }) {
	const isOn = powerState !== "off";
	const driveLedRef = useRef();

	// Flicker the floppy LED while the drive is busy.
	useFrame(({ clock }) => {
		if (!driveLedRef.current) return;
		const lit = isDriveActive && Math.sin(clock.elapsedTime * 60) > -0.2;
		driveLedRef.current.emissiveIntensity = lit ? 3 : 0;
	});

	const clickable = !showPeripherals ? {} : {
		onClick: (event) => {
			event.stopPropagation();
			onSitDown();
		},
		onPointerOver: (event) => {
			event.stopPropagation();
			setCursor("pointer");
		},
		onPointerOut: () => setCursor("auto"),
	};

	const powerClickable = !showPeripherals ? {} : {
		onClick: (event) => {
			event.stopPropagation();
			onPowerButton();
		},
		onPointerOver: (event) => {
			event.stopPropagation();
			setCursor("pointer");
		},
		onPointerOut: () => setCursor("auto"),
	};

	return (
		<group {...props}>
			{/* ─── Desktop case ─── */}
			<group position={[0, 0.075, 0]} {...clickable}>
				<mesh castShadow receiveShadow>
					<boxGeometry args={[0.52, 0.15, 0.44]} />
					<meshStandardMaterial color={BEIGE} roughness={0.65} />
				</mesh>
				{/* front panel seam */}
				<mesh position={[0, 0, 0.221]}>
					<boxGeometry args={[0.5, 0.13, 0.004]} />
					<meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
				</mesh>
				{/* floppy drive */}
				<mesh position={[-0.12, 0.02, 0.224]}>
					<boxGeometry args={[0.2, 0.05, 0.004]} />
					<meshStandardMaterial color="#cbbda1" roughness={0.7} />
				</mesh>
				<mesh position={[-0.12, 0.025, 0.227]}>
					<boxGeometry args={[0.15, 0.008, 0.003]} />
					<meshStandardMaterial color="#1a1412" roughness={0.9} />
				</mesh>
				<mesh position={[-0.2, 0.005, 0.227]}>
					<boxGeometry args={[0.014, 0.005, 0.003]} />
					<meshStandardMaterial ref={driveLedRef} color="#4a3a1c" emissive="#ffb627" emissiveIntensity={0} />
				</mesh>
				{/* vent slots */}
				{Array.from({ length: 8 }).map((_, i) => (
					<mesh key={i} position={[0.07 + i * 0.016, -0.03, 0.224]}>
						<boxGeometry args={[0.006, 0.05, 0.003]} />
						<meshStandardMaterial color="#8a7d63" roughness={0.9} />
					</mesh>
				))}
			</group>

			{/* case power button */}
			<mesh position={[0.2, 0.1, 0.225]} rotation={[Math.PI / 2, 0, 0]} {...powerClickable}>
				<cylinderGeometry args={[0.018, 0.018, 0.01, 20]} />
				<meshStandardMaterial color="#e6dcc6" roughness={0.5} />
			</mesh>

			{/* ─── Monitor stand ─── */}
			<mesh position={[0, 0.165, -0.02]} castShadow>
				<cylinderGeometry args={[0.1, 0.13, 0.03, 24]} />
				<meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
			</mesh>

			{/* ─── CRT monitor ─── */}
			<group position={[0, 0.39, 0]}>
				<group {...clickable}>
					{/* tube housing */}
					<mesh position={[0, 0, -0.08]} castShadow receiveShadow>
						<boxGeometry args={[0.38, 0.34, 0.3]} />
						<meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
					</mesh>
					<mesh position={[0, 0.01, -0.25]} castShadow>
						<boxGeometry args={[0.26, 0.22, 0.12]} />
						<meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
					</mesh>
					{/* front bezel */}
					<mesh position={[0, 0, 0.115]} castShadow receiveShadow>
						<boxGeometry args={[0.46, 0.4, 0.09]} />
						<meshStandardMaterial color={BEIGE} roughness={0.6} />
					</mesh>
					{/* dark recess around the glass */}
					<mesh position={[0, 0.02, 0.1605]}>
						<planeGeometry args={[SCREEN_WIDTH + 0.03, SCREEN_HEIGHT + 0.03]} />
						<meshStandardMaterial color={BEZEL_INNER} roughness={0.8} />
					</mesh>
					{/* glass (the live desktop is drawn over this) */}
					<mesh position={[0, 0.02, 0.161]}>
						<planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
						<meshStandardMaterial color="#0b0508" roughness={0.2} metalness={0.1} emissive="#ff7a1a" emissiveIntensity={isOn ? 0.15 : 0} />
					</mesh>
					{/* badge stripes */}
					{["#ffb627", "#ff7a1a", "#e8352b", "#ff2e88"].map((color, i) => (
						<mesh key={color} position={[-0.17, -0.168 - i * 0.004, 0.161]}>
							<planeGeometry args={[0.03, 0.004]} />
							<meshBasicMaterial color={color} />
						</mesh>
					))}
				</group>

				{/* screen anchor: centre of the glass, facing +Z */}
				<group ref={anchorRef} position={[0, 0.02, 0.162]} />

				{/* power LED + button */}
				<mesh position={[0.135, -0.168, 0.161]}>
					<circleGeometry args={[0.005, 16]} />
					<meshStandardMaterial color={isOn ? "#ffb627" : "#4a2a1c"} emissive="#ffb627" emissiveIntensity={isOn ? 4 : 0} />
				</mesh>
				<mesh position={[0.175, -0.168, 0.165]} {...powerClickable}>
					<boxGeometry args={[0.05, 0.02, 0.012]} />
					<meshStandardMaterial color="#e6dcc6" roughness={0.5} />
				</mesh>
			</group>

			{showPeripherals && (
				<>
					{/* CRT glow spilling onto the desk and keyboard */}
					<pointLight position={[0, 0.4, 0.35]} color="#ffb36b" intensity={isOn ? 0.9 : 0} distance={2.2} decay={2} />

					<Keyboard position={[0, -0.005, 0.42]} rotation={[0.06, 0, 0]} />

					{/* mouse + pad */}
					<mesh position={[0.36, -0.008, 0.42]} receiveShadow>
						<boxGeometry args={[0.2, 0.004, 0.17]} />
						<meshStandardMaterial color="#2b1233" roughness={0.9} />
					</mesh>
					<mesh position={[0.36, 0.008, 0.42]} castShadow>
						<boxGeometry args={[0.055, 0.03, 0.09]} />
						<meshStandardMaterial color={BEIGE} roughness={0.6} />
					</mesh>
				</>
			)}
		</group>
	);
}

export default RetroPC;
