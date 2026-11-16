import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Matrix4, Vector3 } from "three";

/**
 * Pins a normal DOM element (the 800×600 desktop) onto a 3D plane using CSS 3D
 * transforms — the same maths as three's CSS3DRenderer, but the element stays in
 * our React tree so every app keeps its context, state and event handling.
 *
 * World units are metres, which would make CSS values tiny, so the CSS world is
 * scaled up by CSS_SCALE; all that matters is that camera and object agree.
 *
 * When `flat` is set (the visitor is seated and the camera is still), the screen
 * faces the camera head-on, so a plain 2D translate + scale gives the same
 * picture. That is much cheaper to composite — especially without GPU
 * acceleration — and keeps text crisp.
 */
const CSS_SCALE = 1000;

function n(value) {
	return Math.abs(value) < 1e-10 ? 0 : value;
}

function cameraMatrixCSS(m) {
	const e = m.elements;
	const k = CSS_SCALE;
	return `matrix3d(${n(e[0])},${n(-e[1])},${n(e[2])},${n(e[3])},${n(e[4])},${n(-e[5])},${n(e[6])},${n(e[7])},${n(e[8])},${n(-e[9])},${n(e[10])},${n(e[11])},${n(e[12] * k)},${n(-e[13] * k)},${n(e[14] * k)},${n(e[15])})`;
}

function objectMatrixCSS(m) {
	const e = m.elements;
	return `translate(-50%,-50%) matrix3d(${n(e[0])},${n(e[1])},${n(e[2])},${n(e[3])},${n(-e[4])},${n(-e[5])},${n(-e[6])},${n(-e[7])},${n(e[8])},${n(e[9])},${n(e[10])},${n(e[11])},${n(e[12])},${n(e[13])},${n(e[14])},${n(e[15])})`;
}

function ScreenProjector({ anchorRef, viewerRef, cameraElRef, screenElRef, screenWidthMetres, elementWidthPx, elementHeightPx, flat }) {
	const { camera, size, invalidate } = useThree();
	const cache = useRef({});
	const matrices = useMemo(() => ({ object: new Matrix4(), scale: new Matrix4() }), []);
	const corner = useMemo(() => new Vector3(), []);

	// Switching modes: forget cached styles and draw one frame to apply the new one.
	useEffect(() => {
		cache.current = {};
		invalidate();
	}, [flat, invalidate]);

	function applyFlat(anchor, viewer, cameraEl, screenEl) {
		const halfW = screenWidthMetres / 2;
		const halfH = (screenWidthMetres * (elementHeightPx / elementWidthPx)) / 2;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		for (const [x, y] of [
			[-halfW, -halfH],
			[halfW, -halfH],
			[-halfW, halfH],
			[halfW, halfH],
		]) {
			corner.set(x, y, 0).applyMatrix4(anchor.matrixWorld).project(camera);
			const px = ((corner.x + 1) / 2) * size.width;
			const py = ((1 - corner.y) / 2) * size.height;
			minX = Math.min(minX, px);
			maxX = Math.max(maxX, px);
			minY = Math.min(minY, py);
		}
		const scale = (maxX - minX) / elementWidthPx;
		const style = `translate(${minX}px, ${minY}px) scale(${scale})`;
		if (cache.current.flat !== style) {
			viewer.style.perspective = "none";
			cameraEl.style.transform = "none";
			screenEl.style.transformOrigin = "0 0";
			screenEl.style.transform = style;
			cache.current.flat = style;
		}
	}

	useFrame(() => {
		const anchor = anchorRef.current;
		const viewer = viewerRef.current;
		const cameraEl = cameraElRef.current;
		const screenEl = screenElRef.current;
		if (!anchor || !viewer || !cameraEl || !screenEl) return;

		camera.updateMatrixWorld();
		anchor.updateWorldMatrix(true, false);

		if (flat) {
			applyFlat(anchor, viewer, cameraEl, screenEl);
			return;
		}
		if (!cache.current.fov) {
			screenEl.style.transformOrigin = "";
		}

		const halfW = size.width / 2;
		const halfH = size.height / 2;
		const fov = camera.projectionMatrix.elements[5] * halfH;

		if (cache.current.fov !== fov) {
			viewer.style.perspective = `${fov}px`;
			cache.current.fov = fov;
		}
		if (cache.current.width !== size.width || cache.current.height !== size.height) {
			cameraEl.style.width = `${size.width}px`;
			cameraEl.style.height = `${size.height}px`;
			cache.current.width = size.width;
			cache.current.height = size.height;
		}

		const cameraStyle = `translateZ(${fov}px) ${cameraMatrixCSS(camera.matrixWorldInverse)} translate(${halfW}px,${halfH}px)`;
		if (cache.current.camera !== cameraStyle) {
			cameraEl.style.transform = cameraStyle;
			cache.current.camera = cameraStyle;
		}

		// anchor transform in CSS world units, scaled so elementWidthPx spans the glass
		const object = matrices.object.copy(anchor.matrixWorld);
		object.elements[12] *= CSS_SCALE;
		object.elements[13] *= CSS_SCALE;
		object.elements[14] *= CSS_SCALE;
		const pxToCss = (screenWidthMetres / elementWidthPx) * CSS_SCALE;
		object.multiply(matrices.scale.makeScale(pxToCss, pxToCss, pxToCss));

		const objectStyle = objectMatrixCSS(object);
		if (cache.current.object !== objectStyle) {
			screenEl.style.transform = objectStyle;
			cache.current.object = objectStyle;
		}
	});

	return null;
}

export default ScreenProjector;
