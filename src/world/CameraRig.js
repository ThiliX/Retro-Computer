import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./RetroPC";

// Standing in the doorway-ish corner, looking at the desk and window.
export const ROOM_CAMERA_POSITION = [0.8, 1.42, 0.78];
const ROOM_CAMERA_TARGET = [-0.3, 1.02, -0.9];

/**
 * Glides between the room view and "sitting at the desk", where the CRT glass
 * exactly fills the viewport. Adds a slow idle drift and mouse parallax in the room.
 */
function CameraRig({ isZoomed, anchorRef }) {
	const { camera, size } = useThree();
	const lookTarget = useRef(new Vector3(...ROOM_CAMERA_TARGET));
	const temp = useMemo(
		() => ({
			position: new Vector3(),
			target: new Vector3(),
			normal: new Vector3(),
			quaternion: new Quaternion(),
		}),
		[]
	);

	useFrame((state, delta) => {
		const { position, target, normal, quaternion } = temp;

		if (isZoomed && anchorRef.current) {
			const anchor = anchorRef.current;
			anchor.getWorldPosition(target);
			anchor.getWorldQuaternion(quaternion);
			normal.set(0, 0, 1).applyQuaternion(quaternion);

			// Distance at which the 4:3 glass fits the viewport, with a hair of margin.
			const halfFov = (camera.fov * Math.PI) / 360;
			const aspect = size.width / size.height;
			const fitHeight = SCREEN_HEIGHT / 2 / Math.tan(halfFov);
			const fitWidth = SCREEN_WIDTH / 2 / (Math.tan(halfFov) * aspect);
			const distance = Math.max(fitHeight, fitWidth) * 1.02;

			position.copy(target).addScaledVector(normal, distance);
		} else {
			const t = state.clock.elapsedTime;
			position.set(
				ROOM_CAMERA_POSITION[0] + Math.sin(t * 0.18) * 0.06 + state.pointer.x * 0.18,
				ROOM_CAMERA_POSITION[1] + Math.sin(t * 0.23) * 0.025 + state.pointer.y * 0.08,
				ROOM_CAMERA_POSITION[2]
			);
			target.set(ROOM_CAMERA_TARGET[0] + state.pointer.x * 0.05, ROOM_CAMERA_TARGET[1] + state.pointer.y * 0.03, ROOM_CAMERA_TARGET[2]);
		}

		// Frame-rate independent easing; snap once close so the desktop ends up pixel-stable.
		const ease = 1 - Math.exp(-delta * 3.4);
		if (camera.position.distanceToSquared(position) < 1e-8 && lookTarget.current.distanceToSquared(target) < 1e-8) {
			camera.position.copy(position);
			lookTarget.current.copy(target);
		} else {
			camera.position.lerp(position, ease);
			lookTarget.current.lerp(target, ease);
		}
		camera.lookAt(lookTarget.current);
	});

	return null;
}

export default CameraRig;
