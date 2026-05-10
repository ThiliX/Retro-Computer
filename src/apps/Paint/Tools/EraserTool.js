import Tool from "./Tool";

class EraserTool extends Tool {
	constructor(paintRendererRef) {
		super(paintRendererRef);
		this.isErasing = false;
	}

	onMousePressBegin(event) {
		this.isErasing = true;
	}

	onMousePressLeave(event) {
		this.isErasing = false;
	}

	onMouseMove(event) {
		if (!this.isErasing) {
			return;
		}

		const [x, y] = this.paintRendererRef.current.getPixelFromMousePosition(event);
        this.paintRendererRef.current.erasePixel(x, y);
	}

    onToolActivated() {
		// Scope cursor to canvas only, not the whole page
		if (this.paintRendererRef?.current?.ref?.current) {
			this.paintRendererRef.current.ref.current.style.cursor = "url('./icons/mspaint-eraser.png'), crosshair";
		}
	}

	onToolDisabled() {
		if (this.paintRendererRef?.current?.ref?.current) {
			this.paintRendererRef.current.ref.current.style.cursor = "default";
		}
	}
}

export default EraserTool;
