import "./MobileDisclaimer.css";
import userConfig from "../userConfig";

function MobileDisclaimer() {
	return (
		<div className="mobile-disclaimer">
			<span>[ ERROR ] This system requires a desktop display.<br/>Please access from a computer terminal.</span>
			<div className="mobile-disclaimer-icons" style={{ display: "flex", justifyContent: "center", columnGap: "10px", marginTop: "20px" }}>
				{userConfig.socials.github && (
					<a href={userConfig.socials.github}>
						<img src="icons/github.svg" style={{ width: "30px", height: "30px" }} alt="github"></img>
					</a>
				)}
				{userConfig.socials.twitter && (
					<a href={userConfig.socials.twitter}>
						<img src="icons/twitter.svg" style={{ width: "30px", height: "30px" }} alt="twitter"></img>
					</a>
				)}
			</div>
		</div>
	);
}

export default MobileDisclaimer;
