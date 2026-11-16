import Tool from "./Tool";

class CanTool extends Tool {
	// Breadth-first flood fill over the cell grid, reading the canvas once.
	onMouse1Click(event) {
		const renderer = this.paintRendererRef?.current;
		if (!renderer) {
			return;
		}

		const { CANVAS_RESOLUTION: res, CANVAS_COLUMNS: cols, CANVAS_ROWS: rows, CANVAS_WIDTH, CANVAS_HEIGHT } = renderer;
		const ctx = renderer.getContext();
		const pixels = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;

		const colorAt = (x, y) => {
			const i = (y * res * CANVAS_WIDTH + x * res) * 4;
			return (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
		};

		const [startX, startY] = renderer.getPixelFromMousePosition(event);
		const target = colorAt(startX, startY);
		const [r, g, b] = renderer.getSelectedColorRgb();
		if (target === ((r << 16) | (g << 8) | b)) {
			return;
		}

		const visited = new Uint8Array(cols * rows);
		const queue = [[startX, startY]];
		visited[startY * cols + startX] = 1;

		while (queue.length) {
			const [x, y] = queue.shift();
			renderer.paintPixel(x, y);

			for (const [nx, ny] of [
				[x - 1, y],
				[x + 1, y],
				[x, y - 1],
				[x, y + 1],
			]) {
				if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
				const index = ny * cols + nx;
				if (visited[index] || colorAt(nx, ny) !== target) continue;
				visited[index] = 1;
				queue.push([nx, ny]);
			}
		}
	}

	onToolActivated() {
		// Scope cursor to canvas only, not the whole page
		if (this.paintRendererRef?.current?.ref?.current) {
			this.paintRendererRef.current.ref.current.style.cursor = "url('./icons/mspaint-can.png'), crosshair";
		}
	}

	onToolDisabled() {
		if (this.paintRendererRef?.current?.ref?.current) {
			this.paintRendererRef.current.ref.current.style.cursor = "default";
		}
	}
}

export default CanTool;
