import React, { useState } from "react";
import YouTube from "react-youtube";
import "./Volume.css";
import userConfig from "../userConfig";

/** Tray speaker: toggles the background music. */
function Volume() {
	const [isVolumeOn, setIsVolumeOn] = useState(false);

	const onPlayerReady = (event) => {
		event.target.setVolume(8);
		event.target.playVideo();
	};

	return (
		<>
			<button className="xp-tray-icon" onClick={() => setIsVolumeOn((on) => !on)} title={isVolumeOn ? "Music: on (click to mute)" : "Music: off (click to play)"}>
				<img src={isVolumeOn ? "icons/xp/speaker.svg" : "icons/xp/speaker-muted.svg"} alt={isVolumeOn ? "Volume on" : "Volume off"} />
			</button>
			{isVolumeOn && (
				<div className="xp-music-player">
					<YouTube videoId={userConfig.musicVideoId} opts={{ width: "0", height: "0", playerVars: { autoplay: 0 } }} onReady={onPlayerReady} />
				</div>
			)}
		</>
	);
}

export default Volume;
