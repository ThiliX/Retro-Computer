import { useEffect } from "react";

import "./BootScreen.css";
import Wordmark from "./Wordmark";
import userConfig from "../userConfig";

const BOOT_SECONDS = 4.2;

/** Black boot splash with the logo and a sliding progress bar. */
function BootScreen({ onFinished }) {
	useEffect(() => {
		const id = setTimeout(onFinished, BOOT_SECONDS * 1000);
		return () => clearTimeout(id);
	}, [onFinished]);

	return (
		<div className="xp-boot" onDoubleClick={onFinished} title="Double-click to skip">
			<div className="xp-boot-center">
				<Wordmark size="large" />
				<div className="xp-boot-progress">
					<div className="xp-boot-progress-blocks">
						<span />
						<span />
						<span />
					</div>
				</div>
			</div>
			<div className="xp-boot-footer">
				<span>Copyright © {new Date().getFullYear()} {userConfig.name}</span>
				<span className="xp-boot-brand">{userConfig.copyright}</span>
			</div>
		</div>
	);
}

export default BootScreen;
