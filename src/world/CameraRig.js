import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";

// Standing behind and to the right of the chair, taking in the whole setup.
export const ROOM_CAMERA_POSITION = [0.95, 1.5, 1.05];
const ROOM_CAMERA_TARGET = [-0.2, 1.15, -1.0];

const SIT_DOWN_SECONDS = 1.3;

function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Glides between the room view and "sitting at the desk", where the monitor glass
 * exactly fills the viewport.
 *
 * Sitting down is a fixed-length tween so it ends exactly on target; once it
 * lands, `onSettledChange(true)` lets the scene stop rendering (the room is
 * hidden behind the screen anyway). In the room the camera drifts slowly and
 * follows the mouse a little.
 */
function CameraRig({ isZoomed, anchorRef, screenWidth, screenHeight, onSettledChange }) {
	const { camera, size } = useThree();
	const lookTarget = useRef(new Vector3(...ROOM_CAMERA_TARGET));
	const tween = useRef(null);
	const settled = useRef(false);
	const temp = useMemo(
		() => ({
			position: new Vector3(),
			target: new Vector3(),
			normal: new Vector3(),
			quaternion: new Quaternion(),
		}),
		[]
	);

	function reportSettled(value) {
		if (settled.current !== value) {
			settled.current = value;
			onSettledChange?.(value);
		}
	}

	// Start a fresh tween each time the visitor sits down (or the viewport changes size while seated).
	useEffect(() => {
		tween.current = isZoomed ? { from: camera.position.clone(), fromTarget: lookTarget.current.clone(), elapsed: 0 } : null;
		reportSettled(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isZoomed, size.width, size.height]);

	useFrame((state, delta) => {
		const { position, target, normal, quaternion } = temp;

		if (isZoomed && anchorRef.current) {
			const anchor = anchorRef.current;
			anchor.getWorldPosition(target);
			anchor.getWorldQuaternion(quaternion);
			normal.set(0, 0, 1).applyQuaternion(quaternion);

			// Distance at which the glass fits the viewport, with a hair of margin.
			const halfFov = (camera.fov * Math.PI) / 360;
			const aspect = size.width / size.height;
			const fitHeight = screenHeight / 2 / Math.tan(halfFov);
			const fitWidth = screenWidth / 2 / (Math.tan(halfFov) * aspect);
			position.copy(target).addScaledVector(normal, Math.max(fitHeight, fitWidth) * 1.02);

			const t = tween.current;
			if (t) {
				// cap the step so a long stall (e.g. a background tab) doesn't skip the motion
				t.elapsed += Math.min(delta, 0.1);
				const progress = Math.min(t.elapsed / SIT_DOWN_SECONDS, 1);
				const eased = easeInOutCubic(progress);
				camera.position.lerpVectors(t.from, position, eased);
				lookTarget.current.lerpVectors(t.fromTarget, target, eased);
				camera.lookAt(lookTarget.current);
				if (progress >= 1) {
					tween.current = null;
					reportSettled(true);
				}
				return;
			}

			camera.position.copy(position);
			lookTarget.current.copy(target);
			camera.lookAt(lookTarget.current);
			return;
		}

		const time = state.clock.elapsedTime;
		position.set(
			ROOM_CAMERA_POSITION[0] + Math.sin(time * 0.18) * 0.06 + state.pointer.x * 0.18,
			ROOM_CAMERA_POSITION[1] + Math.sin(time * 0.23) * 0.025 + state.pointer.y * 0.08,
			ROOM_CAMERA_POSITION[2]
		);
		target.set(ROOM_CAMERA_TARGET[0] + state.pointer.x * 0.05, ROOM_CAMERA_TARGET[1] + state.pointer.y * 0.03, ROOM_CAMERA_TARGET[2]);

		// frame-rate independent easing back to the room view
		const ease = 1 - Math.exp(-Math.min(delta, 0.1) * 3.4);
		camera.position.lerp(position, ease);
		lookTarget.current.lerp(target, ease);
		camera.lookAt(lookTarget.current);
	});

	return null;
}

export default CameraRig;
