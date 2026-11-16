import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * With `frameloop="demand"`, asks for a new frame at a fixed rate. Used in
 * low-power mode so animations still move without drawing 60 frames a second.
 */
export function FrameThrottle({ active, fps }) {
	const invalidate = useThree((state) => state.invalidate);

	useEffect(() => {
		if (!active) return;
		const id = setInterval(() => invalidate(), 1000 / fps);
		return () => clearInterval(id);
	}, [active, fps, invalidate]);

	return null;
}

/**
 * Watches the real frame rate for a few seconds in the room view and reports
 * if the machine can't keep up, so the scene can drop to low quality.
 */
export function PerformanceWatcher({ enabled, onSlow, minFps = 30 }) {
	const sample = useRef({ elapsed: 0, frames: 0, done: false });

	useEffect(() => {
		sample.current = { elapsed: 0, frames: 0, done: false };
	}, [enabled]);

	useFrame((_, delta) => {
		const s = sample.current;
		if (!enabled || s.done) return;

		s.elapsed += delta;
		// ignore the first second: shader compilation makes it look slower than it is
		if (s.elapsed < 1) return;
		s.frames += 1;

		if (s.elapsed >= 4) {
			s.done = true;
			const fps = s.frames / (s.elapsed - 1);
			if (fps < minFps) onSlow(fps);
		}
	});

	return null;
}
