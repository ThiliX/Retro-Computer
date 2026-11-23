import { useEffect, useImperativeHandle, useRef, useState } from "react";
import "./PaintRenderer.css";
import PencilTool from "./Tools/PencilTool";
import EraserTool from "./Tools/EraserTool";
import ColorPickerTool from "./Tools/ColorPickerTool";
import CanTool from "./Tools/CanTool";

const CANVAS_RESOLUTION = 10;

const CANVAS_WIDTH = 370;
const CANVAS_HEIGHT = 400;

const CANVAS_COLUMNS = Math.floor(CANVAS_WIDTH / CANVAS_RESOLUTION);
const CANVAS_ROWS = Math.floor(CANVAS_HEIGHT / CANVAS_RESOLUTION);

// The classic 28-colour paint box, in two rows.
const PALETTE = [
	["black", [0, 0, 0]],
	["gray", [128, 128, 128]],
	["maroon", [128, 0, 0]],
	["olive", [128, 128, 0]],
	["green", [0, 128, 0]],
	["teal", [0, 128, 128]],
	["navy", [0, 0, 128]],
	["purple", [128, 0, 128]],
	["khaki", [128, 128, 64]],
	["darkSlate", [0, 64, 64]],
	["azure", [0, 128, 255]],
	["indigo", [0, 64, 128]],
	["violet", [64, 0, 255]],
	["brown", [128, 64, 0]],
	["white", [255, 255, 255]],
	["silver", [192, 192, 192]],
	["red", [255, 0, 0]],
	["yellow", [255, 255, 0]],
	["lime", [0, 255, 0]],
	["cyan", [0, 255, 255]],
	["blue", [0, 0, 255]],
	["magenta", [255, 0, 255]],
	["sand", [255, 255, 128]],
	["spring", [0, 255, 128]],
	["sky", [128, 255, 255]],
	["periwinkle", [128, 128, 255]],
	["rose", [255, 0, 128]],
	["orange", [255, 128, 64]],
];

const TOOL_BUTTONS = [
	["pencil", "icons/mspaint-pencil.png"],
	["eraser", "icons/mspaint-eraser.png"],
	["can", "icons/mspaint-can.png"],
	["colorPicker", "icons/mspaint-colorpicker.png"],
];

function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function PaintRenderer({ appCoreRef }) {
	const [currentSelectedTool, setCurrentSelectedTool] = useState("pencil");
	const [selectedPixelColor, setSelectedPixelColor] = useState("#000000");

	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const paintRendererRef = useRef(null);
	const selectedColorRef = useRef(selectedPixelColor);
	const currentToolRef = useRef("pencil");

	// Tools are created once so their internal state (e.g. "is drawing") survives re-renders.
	const toolsRef = useRef(null);
	if (!toolsRef.current) {
		toolsRef.current = {
			pencil: new PencilTool(paintRendererRef),
			eraser: new EraserTool(paintRendererRef),
			can: new CanTool(paintRendererRef),
			colorPicker: new ColorPickerTool(paintRendererRef),
		};
	}

	function paintPixel(x, y, color) {
		const ctx = contextRef.current;
		if (!ctx) return;
		ctx.fillStyle = color || selectedColorRef.current;
		ctx.fillRect(x * CANVAS_RESOLUTION, y * CANVAS_RESOLUTION, CANVAS_RESOLUTION, CANVAS_RESOLUTION);
	}

	function erasePixel(x, y) {
		paintPixel(x, y, "#FFFFFF");
	}

	function setSelectedColor(r, g, b) {
		const hex = rgbToHex(r, g, b);
		selectedColorRef.current = hex;
		setSelectedPixelColor(hex);
	}

	function getSelectedColorRgb() {
		const hex = selectedColorRef.current.replace("#", "");
		return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
	}

	function pickPixelColor(x, y) {
		return contextRef.current.getImageData(x * CANVAS_RESOLUTION, y * CANVAS_RESOLUTION, 1, 1).data;
	}

	// The whole monitor is CSS-scaled, so convert from on-screen pixels to canvas pixels.
	function getPixelFromMousePosition(event) {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const x = Math.floor(((event.clientX - rect.left) * scaleX) / CANVAS_RESOLUTION);
		const y = Math.floor(((event.clientY - rect.top) * scaleY) / CANVAS_RESOLUTION);

		return [Math.min(Math.max(x, 0), CANVAS_COLUMNS - 1), Math.min(Math.max(y, 0), CANVAS_ROWS - 1)];
	}

	function setCurrentTool(tool) {
		const tools = toolsRef.current;
		tools[currentToolRef.current]?.onToolDisabled();
		currentToolRef.current = tool;
		setCurrentSelectedTool(tool);
		tools[tool]?.onToolActivated();
	}

	useImperativeHandle(paintRendererRef, () => ({
		ref: canvasRef,
		appCoreRef: appCoreRef,
		paintPixel,
		erasePixel,
		setSelectedColor,
		getSelectedColorRgb,
		pickPixelColor,
		getPixelFromMousePosition,
		setCurrentTool,
		rgbToHex,
		getContext: () => contextRef.current,
		CANVAS_RESOLUTION,
		CANVAS_WIDTH,
		CANVAS_HEIGHT,
		CANVAS_COLUMNS,
		CANVAS_ROWS,
	}));

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		contextRef.current = ctx;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		const forward = (method) => (event) => toolsRef.current[currentToolRef.current]?.[method](event);

		const onClick = forward("onMouse1Click");
		const onContextMenu = (event) => {
			event.preventDefault();
			forward("onMouse2Click")(event);
		};
		const onMouseDown = forward("onMousePressBegin");
		const onMouseMove = forward("onMouseMove");
		// Listen on window so releasing the button outside the canvas still ends the stroke.
		const onMouseUp = forward("onMousePressLeave");

		canvas.addEventListener("click", onClick);
		canvas.addEventListener("contextmenu", onContextMenu);
		canvas.addEventListener("mousedown", onMouseDown);
		canvas.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);

		return () => {
			canvas.removeEventListener("click", onClick);
			canvas.removeEventListener("contextmenu", onContextMenu);
			canvas.removeEventListener("mousedown", onMouseDown);
			canvas.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, []);

	return (
		<div className="paint-container">
			<div className="xp-menubar">
				<span>File</span>
				<span>Edit</span>
				<span>View</span>
				<span>Image</span>
				<span>Colors</span>
				<span>Help</span>
			</div>
			<div className="paint-canvas-container">
				<div className="paint-tools-container">
					{TOOL_BUTTONS.map(([tool, icon]) => (
						<button
							key={tool}
							className={`paint-${tool.toLowerCase()}-tool ${currentSelectedTool === tool ? "active" : ""}`}
							onClick={() => setCurrentTool(tool)}
							title={tool}
						>
							<img src={icon} style={{ width: "20px", height: "20px" }} alt={tool}></img>
						</button>
					))}
				</div>
				<div className="html-paint-canvas-container">
					<canvas id="paint-canvas" ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
				</div>
			</div>
			<div className="paint-color-container">
				<div className="paint-color-selected-container" title="Current colour">
					<span className="paint-color-selected" style={{ backgroundColor: selectedPixelColor }}></span>
				</div>
				<div className="paint-pallette-container">
					{PALETTE.map(([name, [r, g, b]]) => (
						<button key={name} style={{ backgroundColor: rgbToHex(r, g, b) }} onClick={() => setSelectedColor(r, g, b)} title={name}></button>
					))}
				</div>
			</div>
			<div className="paint-status">For Help, click Help Topics on the Help Menu.</div>
		</div>
	);
}

export default PaintRenderer;
