import "./Wordmark.css";
import userConfig from "../userConfig";

/** "<name> xp" logo used on the boot, welcome and shutdown screens. */
function Wordmark({ size = "large", light = false }) {
	return (
		<div className={`xp-wordmark ${size} ${light ? "light" : ""}`}>
			<img src="icons/xp/logo.svg" alt="" />
			<div className="xp-wordmark-text">
				<span className="xp-wordmark-owner">{userConfig.osOwner}</span>
				<span className="xp-wordmark-name">
					{userConfig.osName}
					<sup>xp</sup>
				</span>
				<span className="xp-wordmark-edition">{userConfig.osEdition}</span>
			</div>
		</div>
	);
}

export default Wordmark;
