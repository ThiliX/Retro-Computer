import Tool from "./Tool";

class ColorPickerTool extends Tool {

	onMouse1Click(event) {
		const [x, y] = this.paintRendererRef.current.getPixelFromMousePosition(event);
		const [r, g, b] = this.paintRendererRef.current.pickPixelColor(x, y);
		this.paintRendererRef.current.setSelectedColor(r, g, b);
	}

    onToolActivated() {
		// Scope cursor to canvas only, not the whole page
		if (this.paintRendererRef?.current?.ref?.current) {
			this.paintRendererRef.current.ref.current.style.cursor = "url('./icons/mspaint-colorpicker.png'), crosshair";
		}
	}

	onToolDisabled() {
		if (this.paintRendererRef?.current?.ref?.current) {
			this.paintRendererRef.current.ref.current.style.cursor = "default";
		}
	}
}

export default ColorPickerTool;
