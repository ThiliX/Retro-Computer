import "./MyPcConfigRenderer.css";
import "../MyPcRenderer.css";
import Button from "../../../components/Button";
import userConfig from "../../../userConfig";

function MyPcConfigRenderer({ appRef }) {
	return (
		<div className="my-pc-renderer-container">
			<div className="my-pc-renderer-title-container">
				<span className="my-pc-renderer-title">ABOUT ME</span>
			</div>
			<div className="my-pc-renderer-container-2">
				<div className="my-pc-info-father-container">
					<div className="my-pc-info-container">
						<div>
							<img src={userConfig.profilePicture} style={{ width: "140px", height: "140px", border: "1px solid #00ff41", boxShadow: "0 0 10px rgba(0,255,65,0.2)" }} alt="selfie"></img>
						</div>
						<div className="my-pc-title2-container">
							<span className="my-pc-title">{userConfig.name}</span>
							<span>{userConfig.pronouns} ➧ {userConfig.age}y ➧ {userConfig.tagline}</span>
						</div>
					</div>
					<div className="my-pc-info-container-2">
						<div className="my-pc-title2-container">
							<span className="my-pc-title-2">Stacks:</span>
							<span>{userConfig.stacks}</span>
						</div>
					</div>
				</div>
			</div>
			<div className="my-pc-config-button-container">
				<Button text={"Ok"} width={"70px"} height={"22px"} />
			</div>
		</div>
	);
}

export default MyPcConfigRenderer;
