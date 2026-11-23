import { useEffect } from "react";

import "./PowerDialog.css";

/**
 * The "Turn off computer" / "Log Off" dialog. The desktop behind it fades to
 * grey (App adds the class) while it is open.
 */
function PowerDialog({ kind, onChoose, onCancel }) {
	useEffect(() => {
		function onKeyDown(event) {
			if (event.key === "Escape") onCancel();
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onCancel]);

	const isTurnOff = kind === "turnOff";
	const title = isTurnOff ? "Turn off computer" : "Log Off";
	const choices = isTurnOff
		? [
				{ id: "standby", label: "Stand By", icon: "icons/xp/standby.svg" },
				{ id: "turnOff", label: "Turn Off", icon: "icons/xp/shutdown.svg" },
				{ id: "restart", label: "Restart", icon: "icons/xp/restart.svg" },
		  ]
		: [
				{ id: "switchUser", label: "Switch User", icon: "icons/xp/restart.svg" },
				{ id: "logOff", label: "Log Off", icon: "icons/xp/logoff.svg" },
		  ];

	return (
		<div className="xp-power-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
			<div className="xp-power-dialog" role="dialog" aria-label={title}>
				<div className="xp-power-header">
					<span>{title}</span>
					<img src="icons/xp/logo.svg" alt="" />
				</div>
				<div className="xp-power-body">
					{choices.map((choice) => (
						<button key={choice.id} className="xp-power-choice" onClick={() => onChoose(choice.id)} autoFocus={choice.id === "turnOff" || choice.id === "logOff"}>
							<img src={choice.icon} alt="" />
							<span>{choice.label}</span>
						</button>
					))}
				</div>
				<div className="xp-power-footer">
					<button className="xp-button" onClick={onCancel}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

export default PowerDialog;
