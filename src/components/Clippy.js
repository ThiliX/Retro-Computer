import "./Clippy.css";

import { useState, useEffect } from "react";
import userConfig from "../userConfig";

function Clippy() {
	const [isClippyOpened, setIsClippyOpened] = useState(false);
	const [clippyText, setClippyText] = useState("[ SYSTEM READY ]");

	useEffect(() => {
		const textTimeoutId = setTimeout(() => {
			setIsClippyOpened(true);

			for (const msg of userConfig.clippyMessages) {
				setTimeout(() => {
					setClippyText(msg.text);
				}, msg.delay * 1000);
			}
		}, 5000);

		const hideClippyTimeoutId = setTimeout(() => {
			setIsClippyOpened(false);
		}, 27000);

		return () => {
			clearTimeout(textTimeoutId);
			clearTimeout(hideClippyTimeoutId);
		};
	}, []);

	return (
		<div>
			{isClippyOpened && (
				<div className="clippy-container">
					<div className="clippy-balloon">
						<span className="clippy-balloon-text">{clippyText}</span>
					</div>
					<div className="clippy-balloon-arrow" />
					<div className="clippy-img">
						<img src="icons/clippy.png" style={{ width: "75px", height: "75px" }} alt="assistant"></img>
					</div>
				</div>
			)}
		</div>
	);
}

export default Clippy;
