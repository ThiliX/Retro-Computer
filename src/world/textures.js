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

/** Dusk sky seen through the window: gradient, striped sun, a far skyline. */
export function createSkyTexture() {
	return makeTexture(1024, 1024, (g, w, h) => {
		const sky = g.createLinearGradient(0, 0, 0, h);
		sky.addColorStop(0, "#1a0821");
		sky.addColorStop(0.35, "#4a1240");
		sky.addColorStop(0.6, "#b8284a");
		sky.addColorStop(0.75, "#ff7a1a");
		sky.addColorStop(0.82, "#ffb627");
		g.fillStyle = sky;
		g.fillRect(0, 0, w, h);

		// stars
		g.fillStyle = "rgba(255, 232, 194, 0.8)";
		for (let i = 0; i < 70; i++) {
			const x = Math.random() * w;
			const y = Math.random() * h * 0.4;
			g.fillRect(x, y, Math.random() < 0.2 ? 2 : 1, Math.random() < 0.2 ? 2 : 1);
		}

		// striped sun sitting on the horizon
		const cx = w * 0.55;
		const cy = h * 0.74;
		const r = w * 0.17;
		const sun = g.createLinearGradient(0, cy - r, 0, cy + r);
		sun.addColorStop(0, "#ffe08a");
		sun.addColorStop(0.5, "#ffb627");
		sun.addColorStop(1, "#ff5a2a");
		g.save();
		g.beginPath();
		g.arc(cx, cy, r, 0, Math.PI * 2);
		g.clip();
		g.fillStyle = sun;
		g.fillRect(cx - r, cy - r, r * 2, r * 2);
		g.globalCompositeOperation = "destination-out";
		for (let i = 0; i < 6; i++) {
			const y = cy + i * r * 0.16;
			g.fillRect(cx - r, y, r * 2, 3 + i * 2.5);
		}
		g.restore();

		// glow around the sun
		const glow = g.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 2.6);
		glow.addColorStop(0, "rgba(255, 140, 40, 0.35)");
		glow.addColorStop(1, "rgba(255, 140, 40, 0)");
		g.fillStyle = glow;
		g.fillRect(0, 0, w, h);

		// city skyline silhouette
		g.fillStyle = "#1c0a1f";
		let x = 0;
		while (x < w) {
			const bw = 30 + Math.random() * 70;
			const bh = 40 + Math.random() * 170;
			g.fillRect(x, h * 0.86 - bh, bw, bh + h);
			// lit windows
			g.fillStyle = "rgba(255, 182, 39, 0.55)";
			for (let wy = h * 0.86 - bh + 10; wy < h * 0.86; wy += 16) {
				for (let wx = x + 6; wx < x + bw - 8; wx += 12) {
					if (Math.random() < 0.18) g.fillRect(wx, wy, 5, 7);
				}
			}
			g.fillStyle = "#1c0a1f";
			x += bw + 4;
		}
		g.fillRect(0, h * 0.86, w, h);
	});
}

/** Wall poster in the Sunset Arcade style. */
export function createPosterTexture() {
	return makeTexture(512, 724, (g, w, h) => {
		const bg = g.createLinearGradient(0, 0, 0, h);
		bg.addColorStop(0, "#1a0b1e");
		bg.addColorStop(0.55, "#5a1a3e");
		bg.addColorStop(1, "#ff7a1a");
		g.fillStyle = bg;
		g.fillRect(0, 0, w, h);

		// sun
		const cx = w / 2;
		const cy = h * 0.52;
		const r = w * 0.3;
		const sun = g.createLinearGradient(0, cy - r, 0, cy + r);
		sun.addColorStop(0, "#ffd27a");
		sun.addColorStop(1, "#e8352b");
		g.save();
		g.beginPath();
		g.arc(cx, cy, r, Math.PI, 0);
		g.closePath();
		g.clip();
		g.fillStyle = sun;
		g.fillRect(cx - r, cy - r, r * 2, r);
		g.globalCompositeOperation = "destination-out";
		for (let i = 0; i < 5; i++) g.fillRect(cx - r, cy - r * 0.45 + i * r * 0.1, r * 2, 2 + i * 2);
		g.restore();

		// grid
		g.strokeStyle = "#ff2e88";
		g.lineWidth = 2;
		for (let i = -8; i <= 8; i++) {
			g.beginPath();
			g.moveTo(cx, cy);
			g.lineTo(cx + i * 70, h);
			g.stroke();
		}
		for (let i = 0; i < 7; i++) {
			const y = cy + Math.pow(i / 7, 2) * (h - cy);
			g.beginPath();
			g.moveTo(0, y);
			g.lineTo(w, y);
			g.stroke();
		}

		// title
		g.textAlign = "center";
		g.fillStyle = "#ffe8c2";
		g.font = "bold 58px 'Press Start 2P', monospace";
		g.shadowColor = "#ff2e88";
		g.shadowBlur = 18;
		g.fillText("SUNSET", cx, 110);
		g.fillText("ARCADE", cx, 180);
		g.shadowBlur = 0;
		g.font = "22px 'Press Start 2P', monospace";
		g.fillStyle = "#ffb627";
		g.fillText("WORLD TOUR '97", cx, 225);

		g.strokeStyle = "#ffe8c2";
		g.lineWidth = 6;
		g.strokeRect(14, 14, w - 28, h - 28);
	});
}

/** Wooden floor planks. */
export function createFloorTexture() {
	const texture = makeTexture(512, 512, (g, w, h) => {
		const plankH = h / 8;
		for (let i = 0; i < 8; i++) {
			const shade = 70 + Math.random() * 25;
			g.fillStyle = `rgb(${shade + 40}, ${shade}, ${shade - 30})`;
			g.fillRect(0, i * plankH, w, plankH);
			// grain
			g.strokeStyle = "rgba(40, 20, 10, 0.25)";
			for (let k = 0; k < 6; k++) {
				g.beginPath();
				const y = i * plankH + Math.random() * plankH;
				g.moveTo(0, y);
				g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2);
				g.stroke();
			}
			g.fillStyle = "rgba(20, 8, 4, 0.6)";
			g.fillRect(0, i * plankH, w, 2);
			const joint = Math.random() * w;
			g.fillRect(joint, i * plankH, 2, plankH);
		}
	});
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(3, 3);
	return texture;
}

/** Round rug with concentric sunset stripes. */
export function createRugTexture() {
	return makeTexture(512, 512, (g, w, h) => {
		const colors = ["#2b1233", "#8c1c3a", "#e8352b", "#ff7a1a", "#ffb627", "#ff7a1a", "#e8352b", "#8c1c3a"];
		const cx = w / 2;
		const cy = h / 2;
		for (let i = 0; i < colors.length; i++) {
			g.beginPath();
			g.arc(cx, cy, (w / 2) * (1 - i / colors.length), 0, Math.PI * 2);
			g.fillStyle = colors[i];
			g.fill();
		}
	});
}

/** Faint vertical-stripe wallpaper. */
export function createWallTexture() {
	const texture = makeTexture(256, 256, (g, w, h) => {
		g.fillStyle = "#7a4a5a";
		g.fillRect(0, 0, w, h);
		for (let x = 0; x < w; x += 32) {
			g.fillStyle = "rgba(255, 210, 160, 0.06)";
			g.fillRect(x, 0, 14, h);
		}
	});
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(6, 3);
	return texture;
}
