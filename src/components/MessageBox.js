import { useEffect } from "react";

import "./MessageBox.css";

const ICONS = {
	info: "icons/xp/info.svg",
	error: "icons/xp/error.svg",
};

/** Small modal XP message box with an icon, a message and an OK button. */
function MessageBox({ title, message, kind = "info", onClose }) {
	useEffect(() => {
		function onKeyDown(event) {
			if (event.key === "Escape" || event.key === "Enter") onClose();
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	return (
		<div className="xp-message-overlay">
			<div className="xp-window active xp-message" role="alertdialog" aria-label={title}>
				<div className="xp-titlebar">
					<div className="xp-titlebar-title">{title}</div>
					<div className="xp-titlebar-buttons">
						<button className="xp-caption-btn close" onClick={onClose} aria-label="Close" />
					</div>
				</div>
				<div className="xp-window-body xp-message-body">
					<div className="xp-message-content">
						<img src={ICONS[kind]} alt="" />
						<p>{message}</p>
					</div>
					<button className="xp-button" onClick={onClose} autoFocus>
						OK
					</button>
				</div>
			</div>
		</div>
	);
}

export default MessageBox;
