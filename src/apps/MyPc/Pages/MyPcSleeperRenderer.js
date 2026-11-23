import { useState } from "react";

import "../MyPcRenderer.css";

const SCHEMES = {
	"Always On": { monitor: "Never", disks: "Never", standby: "Never", note: "Coding sprint mode. Coffee required." },
	"Home/Office Desk": { monitor: "After 20 mins", disks: "After 30 mins", standby: "After 1 hour", note: "A balanced day of building things." },
	"Gaming Night": { monitor: "Never", disks: "Never", standby: "After 4 hours", note: "One more match, then bed. Probably." },
};

/** "Power" tab: playful Power Options schemes. */
function MyPcSleeperRenderer() {
	const [scheme, setScheme] = useState("Always On");
	const current = SCHEMES[scheme];

	return (
		<div className="sysprop">
			<fieldset className="sysprop-fieldset">
				<legend>Power schemes</legend>
				<div className="power-scheme-row">
					<img src="icons/xp/standby.svg" alt="" />
					<p className="sysprop-note">Select the power scheme with the most appropriate settings for this developer.</p>
				</div>
				<select className="xp-select" value={scheme} onChange={(event) => setScheme(event.target.value)}>
					{Object.keys(SCHEMES).map((name) => (
						<option key={name}>{name}</option>
					))}
				</select>
			</fieldset>
			<fieldset className="sysprop-fieldset">
				<legend>Settings for {scheme} power scheme</legend>
				<div className="power-settings">
					<span>Turn off monitor:</span>
					<span className="xp-readonly">{current.monitor}</span>
					<span>Turn off hard disks:</span>
					<span className="xp-readonly">{current.disks}</span>
					<span>System standby:</span>
					<span className="xp-readonly">{current.standby}</span>
				</div>
				<p className="sysprop-note">{current.note}</p>
			</fieldset>
		</div>
	);
}

export default MyPcSleeperRenderer;
