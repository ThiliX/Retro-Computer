import "./MobileDisclaimer.css";
import userConfig from "../userConfig";

const SOCIAL_ICONS = {
	github: "icons/github.svg",
	twitter: "icons/twitter.svg",
	instagram: "icons/instagram.png",
	spotify: "icons/spotify.png",
	steam: "icons/steam.png",
	linkedin: "icons/linkedin.svg",
	youtube: "icons/youtube.svg",
};

function MobileDisclaimer() {
	return (
		<div className="mobile-disclaimer">
			<span>
				[ ERROR ] This system requires a desktop display.
				<br />
				Please access from a computer terminal.
			</span>
			<div className="mobile-disclaimer-icons" style={{ display: "flex", justifyContent: "center", columnGap: "10px", marginTop: "20px" }}>
				{Object.entries(SOCIAL_ICONS)
					.filter(([key]) => userConfig.socials[key])
					.map(([key, icon]) => (
						<a key={key} href={userConfig.socials[key]} target="_blank" rel="noopener noreferrer">
							<img src={icon} style={{ width: "30px", height: "30px" }} alt={key}></img>
						</a>
					))}
			</div>
		</div>
	);
}

export default MobileDisclaimer;
