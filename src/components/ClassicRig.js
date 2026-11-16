import { useEffect } from "react";

// Total footprint of monitor + stand + case, used to fit the whole PC in the viewport.
const RIG_WIDTH = 1040;
const RIG_HEIGHT = 1060;

function useFitToViewport() {
	useEffect(() => {
		function fit() {
			const scale = Math.min(window.innerWidth / RIG_WIDTH, window.innerHeight / RIG_HEIGHT);
			document.documentElement.style.setProperty("--rig-scale", String(scale));
		}
		fit();
		window.addEventListener("resize", fit);
		return () => window.removeEventListener("resize", fit);
	}, []);
}

/** The flat, front-on beige PC ("Classic mode"). */
function ClassicRig({ screen, isPoweredOn, isDriveActive, onPowerButton }) {
	useFitToViewport();

	return (
		<div className="main" id="computer-main">
			<div className="computer-crt-container">
				<div className="computer-screen-container">
					<div className="computer-screen">{screen}</div>
				</div>
				<div className="computer-badge" aria-hidden="true">
					<span className="computer-badge-stripes" />
					<span className="computer-badge-text">SUNSET 586</span>
				</div>
				<div className="computer-button-container">
					<div className={`computer-button-light ${isPoweredOn ? "on" : ""}`} />
					<button className="computer-button" onClick={onPowerButton} aria-label={isPoweredOn ? "Power off" : "Power on"} />
				</div>
			</div>

			<div className="computer-stand"></div>

			<div className="computer-case">
				<div className="computer-diskhat-container" style={{ height: "100%", width: "100%" }}>
					<div className="computer-diskhat">
						<div className="computer-diskhat-input-container">
							<div className="computer-diskhat-input">
								<div className="computer-diskhat-input-2"></div>
							</div>

							<div className="computer-diskhat-button-container" style={{ height: "100px", width: "300px", position: "absolute" }}>
								<div className={`computer-diskhat-led ${isDriveActive ? "active" : ""}`} />
								<div className="computer-diskhat-button"></div>
							</div>
						</div>
					</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", paddingTop: "30px" }}>
					<div className="computer-turn-button-container">
						<button className="computer-turn-button" onClick={onPowerButton} aria-label="Power" />
					</div>

					<div className="computer-case-fans-container">
						<img src="icons/fans.png" style={{ width: "279px", height: "80px" }} alt=""></img>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ClassicRig;
