import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

// All room textures are drawn on canvases at runtime, so the scene needs no image downloads.

function makeTexture(width, height, draw) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	draw(canvas.getContext("2d"), width, height);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

/** Rainy night city seen through the window. */
export function createNightSkyTexture() {
	return makeTexture(1024, 1024, (g, w, h) => {
		const sky = g.createLinearGradient(0, 0, 0, h);
		sky.addColorStop(0, "#05040c");
		sky.addColorStop(0.5, "#120a26");
		sky.addColorStop(0.78, "#3a1238");
		sky.addColorStop(0.9, "#5a1a2e");
		g.fillStyle = sky;
		g.fillRect(0, 0, w, h);

		// light pollution glow on the horizon
		const glow = g.createRadialGradient(w * 0.5, h * 0.95, 20, w * 0.5, h * 0.95, w * 0.7);
		glow.addColorStop(0, "rgba(255, 122, 26, 0.35)");
		glow.addColorStop(1, "rgba(255, 122, 26, 0)");
		g.fillStyle = glow;
		g.fillRect(0, 0, w, h);

		// skyline in three depth layers
		const layers = [
			{ base: 0.82, min: 60, max: 220, color: "#1a0f2a", lit: 0.12 },
			{ base: 0.9, min: 120, max: 380, color: "#120a1c", lit: 0.2 },
			{ base: 1.0, min: 200, max: 520, color: "#0a0612", lit: 0.28 },
		];
		const windowColors = ["rgba(255, 182, 39, 0.8)", "rgba(255, 122, 26, 0.7)", "rgba(46, 196, 182, 0.6)", "rgba(255, 46, 136, 0.6)"];
		layers.forEach((layer) => {
			let x = -20;
			while (x < w) {
				const bw = 40 + Math.random() * 90;
				const bh = layer.min + Math.random() * (layer.max - layer.min);
				const top = h * layer.base - bh;
				g.fillStyle = layer.color;
				g.fillRect(x, top, bw, h);
				for (let wy = top + 10; wy < h * layer.base - 6; wy += 14) {
					for (let wx = x + 6; wx < x + bw - 6; wx += 10) {
						if (Math.random() < layer.lit) {
							g.fillStyle = windowColors[Math.floor(Math.random() * windowColors.length)];
							g.fillRect(wx, wy, 4, 6);
						}
					}
				}
				// rooftop beacon
				if (Math.random() < 0.3) {
					g.fillStyle = "rgba(232, 53, 43, 0.9)";
					g.fillRect(x + bw / 2 - 2, top - 4, 4, 4);
				}
				x += bw + 3;
			}
		});
	});
}

/** Transparent rain streaks, scrolled down over the window glass. */
export function createRainTexture() {
	const texture = makeTexture(256, 512, (g, w, h) => {
		g.clearRect(0, 0, w, h);
		for (let i = 0; i < 140; i++) {
			const x = Math.random() * w;
			const y = Math.random() * h;
			const len = 10 + Math.random() * 30;
			g.strokeStyle = `rgba(200, 210, 255, ${0.08 + Math.random() * 0.2})`;
			g.lineWidth = 1;
			g.beginPath();
			g.moveTo(x, y);
			g.lineTo(x - 2, y + len);
			g.stroke();
		}
		// a few clinging droplets
		for (let i = 0; i < 40; i++) {
			g.fillStyle = `rgba(220, 225, 255, ${0.15 + Math.random() * 0.2})`;
			g.beginPath();
			g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 0, Math.PI * 2);
			g.fill();
		}
	});
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	return texture;
}

/** Neon sign: glowing tube lettering on a transparent background. */
export function createNeonSignTexture(text, color) {
	return makeTexture(1024, 256, (g, w, h) => {
		g.clearRect(0, 0, w, h);
		g.textAlign = "center";
		g.textBaseline = "middle";
		g.font = "bold 150px 'Press Start 2P', 'Arial Black', sans-serif";
		const fontSize = Math.min(150, (w * 0.9) / Math.max(text.length, 1) / 0.95);
		g.font = `bold ${fontSize}px 'Press Start 2P', 'Arial Black', sans-serif`;

		// outer glow passes, then a bright core
		g.shadowColor = color;
		for (const blur of [40, 24, 12]) {
			g.shadowBlur = blur;
			g.fillStyle = color;
			g.fillText(text, w / 2, h / 2);
		}
		g.shadowBlur = 4;
		g.fillStyle = "#fff4ec";
		g.globalAlpha = 0.85;
		g.fillText(text, w / 2, h / 2);
	});
}

/** Large desk mat: dark cloth with a stitched sunset edge and a small logo. */
export function createDeskMatTexture(text) {
	return makeTexture(1024, 448, (g, w, h) => {
		g.fillStyle = "#141018";
		g.fillRect(0, 0, w, h);
		// subtle cloth noise
		for (let i = 0; i < 4000; i++) {
			g.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.025})`;
			g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
		}
		// sunset horizon art in the corner
		const grad = g.createLinearGradient(w * 0.62, 0, w, 0);
		grad.addColorStop(0, "rgba(255, 46, 136, 0)");
		grad.addColorStop(1, "rgba(255, 122, 26, 0.35)");
		g.fillStyle = grad;
		g.fillRect(w * 0.62, h * 0.55, w * 0.38, h * 0.45);
		g.strokeStyle = "rgba(255, 46, 136, 0.35)";
		g.lineWidth = 2;
		for (let i = 0; i < 8; i++) {
			const y = h * 0.62 + i * i * 4;
			g.beginPath();
			g.moveTo(w * 0.66, y);
			g.lineTo(w, y);
			g.stroke();
		}
		g.fillStyle = "rgba(255, 232, 194, 0.55)";
		g.font = "bold 26px 'Press Start 2P', monospace";
		g.textAlign = "right";
		g.fillText(text, w - 36, h - 34);
		// stitched edge
		g.strokeStyle = "#ff7a1a";
		g.lineWidth = 6;
		g.strokeRect(6, 6, w - 12, h - 12);
	});
}

/** Dark wooden floor planks. */
export function createFloorTexture() {
	const texture = makeTexture(512, 512, (g, w, h) => {
		const plankH = h / 8;
		for (let i = 0; i < 8; i++) {
			const shade = 34 + Math.random() * 14;
			g.fillStyle = `rgb(${shade + 18}, ${shade + 6}, ${shade})`;
			g.fillRect(0, i * plankH, w, plankH);
			g.strokeStyle = "rgba(0, 0, 0, 0.25)";
			for (let k = 0; k < 6; k++) {
				g.beginPath();
				const y = i * plankH + Math.random() * plankH;
				g.moveTo(0, y);
				g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2);
				g.stroke();
			}
			g.fillStyle = "rgba(0, 0, 0, 0.6)";
			g.fillRect(0, i * plankH, w, 2);
			g.fillRect(Math.random() * w, i * plankH, 2, plankH);
		}
	});
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(3, 3);
	return texture;
}

/** Round rug: charcoal with a glowing-orange ring pattern. */
export function createRugTexture() {
	return makeTexture(512, 512, (g, w, h) => {
		const cx = w / 2;
		const cy = h / 2;
		const rings = ["#1a1420", "#2a1a2a", "#ff7a1a", "#1a1420", "#e8352b", "#1a1420", "#2a1a2a"];
		rings.forEach((color, i) => {
			g.beginPath();
			g.arc(cx, cy, (w / 2) * (1 - i * 0.07), 0, Math.PI * 2);
			g.fillStyle = color;
			g.fill();
		});
		g.beginPath();
		g.arc(cx, cy, w * 0.25, 0, Math.PI * 2);
		g.fillStyle = "#1a1420";
		g.fill();
	});
}

/** Acoustic-panel wall: charcoal with faint vertical grooves. */
export function createWallTexture() {
	const texture = makeTexture(256, 256, (g, w, h) => {
		g.fillStyle = "#1c1720";
		g.fillRect(0, 0, w, h);
		for (let x = 0; x < w; x += 16) {
			g.fillStyle = "rgba(0, 0, 0, 0.25)";
			g.fillRect(x, 0, 3, h);
			g.fillStyle = "rgba(255, 255, 255, 0.025)";
			g.fillRect(x + 3, 0, 2, h);
		}
	});
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(8, 3);
	return texture;
}
