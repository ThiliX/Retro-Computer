import "./TxtRenderer.css";
import userConfig from "../../userConfig";

/** Notepad showing the "about me" text. */
function TxtRenderer() {
	const { intro, paragraph1, paragraph2, paragraph3 } = userConfig.aboutMe;

	return (
		<div className="notepad">
			<div className="xp-menubar">
				<span>File</span>
				<span>Edit</span>
				<span>Format</span>
				<span>View</span>
				<span>Help</span>
			</div>
			<div className="notepad-page" tabIndex={0}>
				<p>{intro}</p>
				<p>{paragraph1}</p>
				<p>{paragraph2}</p>
				<p>{paragraph3}</p>
				<p>
					-- {userConfig.name}
					<br />
					{userConfig.tagline}
				</p>
			</div>
		</div>
	);
}

export default TxtRenderer;
