import "../MyPcRenderer.css";
import Button from "../../../components/Button";
import Wordmark from "../../../components/Wordmark";
import userConfig from "../../../userConfig";

/** "General" tab: who this computer belongs to. */
function MyPcConfigRenderer({ appRef }) {
	return (
		<div className="sysprop">
			<div className="sysprop-general">
				<div className="sysprop-logo">
					<img className="sysprop-photo" src={userConfig.profilePicture} alt="" />
				</div>
				<div className="sysprop-facts">
					<h4>System:</h4>
					<p>
						{userConfig.osOwner} {userConfig.osName} XP
						<br />
						{userConfig.osEdition}
					</p>
					<h4>Registered to:</h4>
					<p>
						{userConfig.name}
						<br />
						{userConfig.pronouns} · {userConfig.age} · {userConfig.location}
						<br />
						{userConfig.tagline}
					</p>
					<h4>Stacks:</h4>
					<p>{userConfig.stacks}</p>
					<h4>Computer:</h4>
					<p>
						{userConfig.pcSpecs.cpu}
						<br />
						{userConfig.pcSpecs.ram}
					</p>
				</div>
			</div>
			<div className="sysprop-wordmark">
				<Wordmark size="small" />
			</div>
			<div className="sysprop-buttons">
				<Button text="OK" onClick={() => appRef?.current?.close()} />
			</div>
		</div>
	);
}

export default MyPcConfigRenderer;
