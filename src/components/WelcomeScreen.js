import "./WelcomeScreen.css";
import Wordmark from "./Wordmark";
import userConfig from "../userConfig";

/**
 * The blue welcome screen, in four moods:
 *  - "login":       pick the user tile to log on
 *  - "welcome":     big "welcome" while the desktop loads
 *  - "loggingOff":  "Logging off..."
 *  - "shuttingDown": "Shutting down..."
 */
function WelcomeScreen({ mode, onLogin, onTurnOff }) {
	const statusText = {
		welcome: "welcome",
		loggingOff: "logging off...",
		shuttingDown: "shutting down...",
	}[mode];

	return (
		<div className={`xp-welcome ${mode}`}>
			<div className="xp-welcome-top" />

			<div className="xp-welcome-middle">
				{mode === "login" ? (
					<>
						<div className="xp-welcome-left">
							<Wordmark size="small" />
							<p>To begin, click your user name</p>
						</div>
						<div className="xp-welcome-divider" />
						<div className="xp-welcome-right">
							<button className="xp-user-tile" onClick={onLogin} autoFocus>
								<img src={userConfig.profilePicture} alt="" />
								<span className="xp-user-tile-text">
									<span className="xp-user-tile-name">{userConfig.name}</span>
									<span className="xp-user-tile-hint">{userConfig.tagline}</span>
								</span>
							</button>
						</div>
					</>
				) : (
					<div className="xp-welcome-status">
						<span>{statusText}</span>
					</div>
				)}
			</div>

			<div className="xp-welcome-bottom">
				{mode === "login" && (
					<>
						<button className="xp-welcome-power" onClick={onTurnOff}>
							<img src="icons/xp/shutdown.svg" alt="" />
							<span>Turn off computer</span>
						</button>
						<span className="xp-welcome-note">
							After you log on, double-click the desktop icons to explore.
							<br />
							Everything here, sounds included, is made in code.
						</span>
					</>
				)}
			</div>
		</div>
	);
}

export default WelcomeScreen;
