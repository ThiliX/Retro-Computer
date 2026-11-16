import { useEffect } from "react";
import "./WorldHud.css";

/** Small overlay controls: stand up, power, and the 3D / Classic switch. */
function WorldHud({ viewMode, isZoomed, isPoweredOn, onToggleView, onStandUp, onPowerButton }) {
	const is3D = viewMode === "3d";

	// Esc stands up from the desk.
	useEffect(() => {
		if (!is3D || !isZoomed) return;
		function onKeyDown(event) {
			if (event.key === "Escape") onStandUp();
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [is3D, isZoomed, onStandUp]);

	return (
		<div className="world-hud">
			<div className="world-hud-group">
				{is3D && isZoomed && (
					<button className="world-hud-button" onClick={onStandUp}>
						◀ STAND UP <span className="world-hud-key">ESC</span>
					</button>
				)}
				{is3D && isZoomed && (
					<button className="world-hud-button" onClick={onPowerButton} title={isPoweredOn ? "Switch the PC off" : "Switch the PC on"}>
						⏻ {isPoweredOn ? "OFF" : "ON"}
					</button>
				)}
			</div>

			{is3D && !isZoomed && <div className="world-hud-hint">Click the computer to sit down</div>}

			<button className="world-hud-button" onClick={onToggleView} title="Switch between the 3D room and the flat classic view">
				{is3D ? "▣ CLASSIC 2D" : "◆ 3D ROOM"}
			</button>
		</div>
	);
}

export default WorldHud;
