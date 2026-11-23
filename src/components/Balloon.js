import { useEffect, useState } from "react";

import "./Balloon.css";
import userConfig from "../userConfig";
import { playNotify } from "../audio/xpAudio";

const FIRST_TIP_DELAY = 2500;

/** Yellow tray notification balloon that walks through `userConfig.balloonTips`. */
function Balloon() {
	const tips = userConfig.balloonTips || [];
	const [index, setIndex] = useState(-1);

	useEffect(() => {
		if (!tips.length) return;
		const ids = [];
		let at = FIRST_TIP_DELAY;
		tips.forEach((tip, i) => {
			ids.push(setTimeout(() => setIndex(i), at));
			at += (tip.seconds || 6) * 1000;
		});
		ids.push(setTimeout(() => setIndex(-1), at));
		ids.push(setTimeout(playNotify, FIRST_TIP_DELAY));
		return () => ids.forEach(clearTimeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (index < 0) return null;
	const tip = tips[index];

	return (
		<div className="xp-balloon" role="status" key={index}>
			<div className="xp-balloon-header">
				<img src="icons/xp/info.svg" alt="" />
				<span>{tip.title}</span>
				<button onClick={() => setIndex(-1)} aria-label="Close">
					×
				</button>
			</div>
			<p>{tip.text}</p>
		</div>
	);
}

export default Balloon;
