import "../MyPcRenderer.css";
import userConfig from "../../../userConfig";

const SPEC_LABELS = {
	cpu: "Processor",
	gpu: "Display adapter",
	motherboard: "Motherboard",
	ram: "Memory",
	storage1: "Disk drive",
	storage2: "Disk drive",
	cooling: "Cooling",
};

const PERIPHERAL_LABELS = {
	monitor: "Monitor",
	keyboard: "Keyboard",
	mouse: "Mouse",
	headset: "Sound device",
	mousepad: "Desk mat",
};

/** "Hardware" tab: a Device Manager style list of the real PC. */
function MyPcSetupRenderer() {
	const group = (title, labels, values) => (
		<div className="devices-group">
			<div className="devices-group-title">
				<span className="devices-toggle">−</span>
				<img src="icons/xp/computer.svg" alt="" />
				{title}
			</div>
			{Object.entries(labels)
				.filter(([key]) => values[key])
				.map(([key, label]) => (
					<div className="devices-item" key={key}>
						<span className="devices-label">{label}</span>
						<span>{values[key]}</span>
					</div>
				))}
		</div>
	);

	return (
		<div className="sysprop">
			<fieldset className="sysprop-fieldset">
				<legend>Device Manager</legend>
				<p className="sysprop-note">The hardware in my real-world setup.</p>
				<div className="devices">
					{group("Inside the case", SPEC_LABELS, userConfig.pcSpecs)}
					{group("On the desk", PERIPHERAL_LABELS, userConfig.peripherals)}
				</div>
			</fieldset>
		</div>
	);
}

export default MyPcSetupRenderer;
