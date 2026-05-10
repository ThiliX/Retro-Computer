import "./TxtRenderer.css";
import userConfig from "../../userConfig";

function TxtRenderer({ appCoreRef }) {
	return (
		<div className="app-txt-renderer-container">
			{userConfig.aboutMe.intro}
			<div>
				<br />
			</div>
			<span>
				{userConfig.aboutMe.paragraph1}
			</span>
			<div className="app-txt-renderer-selfie">
				<span>
					{userConfig.aboutMe.paragraph2}
				</span>
			</div>
			<div>
				<br />
			</div>
			<div>
				{userConfig.aboutMe.paragraph3}
			</div>
		</div>
	);
}

export default TxtRenderer;
