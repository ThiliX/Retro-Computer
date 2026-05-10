import "./MyPcSetupRenderer.css";
import "../MyPcRenderer.css";
import userConfig from "../../../userConfig";

function MyPcSetupRenderer({ appRef }) {
	return (
		<div className="my-pc-renderer-container">
			<div className="my-pc-renderer-title-container">
				<span className="my-pc-renderer-title">config</span>
			</div>
			<div className="my-pc-renderer-container-2">
				<div className="my-pc-info-father-container">
					<div className="my-pc-info-container">
						<div className="my-pc-title3-container">
							{userConfig.pcSpecs.gpu}
							<br/>{userConfig.pcSpecs.cpu}
							<br/>{userConfig.pcSpecs.motherboard}
							<br/>{userConfig.pcSpecs.ram}
							<br/>{userConfig.pcSpecs.storage1}
							<br/>{userConfig.pcSpecs.storage2}
							<br/>{userConfig.pcSpecs.cooling}
						</div>
						<div>
							<img src="icons/computer.png" style={{ width: "140px", height: "140px", filter: "hue-rotate(80deg) brightness(0.8)" }} alt="computer"></img>
						</div>
					</div>
				</div>
			</div>
			<div className="my-pc-renderer-title-container">
				<span className="my-pc-renderer-title">setup</span>
			</div>
			<div className="my-pc-renderer-container-2">
				<div className="my-pc-info-father2-container">
					<div className="my-pc-setup-info-container">
						Mouse: {userConfig.peripherals.mouse}
						<br/>Headset: {userConfig.peripherals.headset}
						<br/>Monitor: {userConfig.peripherals.monitor}
					</div>
					<div className="my-pc-setup-info-container">
						Keyboard: {userConfig.peripherals.keyboard}
						<br/>Mousepad: {userConfig.peripherals.mousepad}
					</div>
				</div>
			</div>
		</div>
	);
}

export default MyPcSetupRenderer;
