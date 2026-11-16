import { useEffect, useState } from "react";
import "./RetroBox.css";
import userConfig from "../userConfig";

export const HOST_WIDTH = 1280;
export const HOST_HEIGHT = 720;

function HostClock() {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 15000);
		return () => clearInterval(id);
	}, []);
	return (
		<div className="host-clock">
			<span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
			<span className="host-clock-date">{now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span>
		</div>
	);
}

/**
 * The modern gaming PC's screen. Its "host OS" runs RetroBox, a made-up
 * emulator, and the 90s Sunset OS (the `screen` element, 800×600) lives inside.
 */
function RetroBox({ screen, powerState, isDriveActive, onReset, onInsertDisk }) {
	const [isCrtFilterOn, setIsCrtFilterOn] = useState(true);
	const hostName = (userConfig.copyright || "RETRO").replace(/©/g, "").trim().toUpperCase();

	if (powerState === "off") {
		// Modern monitors just go black in standby.
		return <div className="host host-off" />;
	}

	return (
		<div className="host">
			<div className="host-wallpaper" />
			<div className="host-brand">
				<span className="host-brand-mark" />
				{hostName} <span className="host-brand-sub">{"// battlestation"}</span>
			</div>

			<div className="retrobox-window">
				<div className="retrobox-titlebar">
					<div className="retrobox-title">
						<span className="retrobox-logo">RB</span>
						RetroBox <span className="retrobox-title-dim">— Sunset OS 98 · 586 · 32 MB</span>
					</div>
					<div className="retrobox-toolbar">
						<button className="retrobox-tool" onClick={onInsertDisk} title="Insert a floppy disk">
							💾 Disk
						</button>
						<button className={`retrobox-tool ${isCrtFilterOn ? "active" : ""}`} onClick={() => setIsCrtFilterOn((on) => !on)} title="Toggle the CRT scanline filter">
							CRT {isCrtFilterOn ? "ON" : "OFF"}
						</button>
						<button className="retrobox-tool" onClick={onReset} title="Restart the emulated machine">
							⟲ Reset
						</button>
					</div>
				</div>

				<div className={`retrobox-display ${isCrtFilterOn ? "" : "crt-filter-off"}`}>{screen}</div>

				<div className="retrobox-statusbar">
					<span className={`retrobox-led ${powerState !== "off" ? "on" : ""}`} />
					{powerState === "booting" ? "Booting…" : "Running"}
					<span className="retrobox-status-sep">|</span>
					<span className={`retrobox-led drive ${isDriveActive ? "on" : ""}`} />
					Drive A:
					<span className="retrobox-status-right">800×600 · 60 Hz</span>
				</div>
			</div>

			<div className="host-dock">
				<div className="host-dock-item active" title="RetroBox">
					RB
				</div>
				<div className="host-dock-item" title="Music">
					♪
				</div>
				<div className="host-dock-item" title="Settings">
					⚙
				</div>
				<HostClock />
			</div>
		</div>
	);
}

export default RetroBox;
