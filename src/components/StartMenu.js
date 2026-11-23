import { useEffect, useRef, useState } from "react";

import "./StartMenu.css";
import userConfig from "../userConfig";

/**
 * Two-column XP Start menu.
 * Every item is { label, icon, action, bold?, subtitle? }; `href` items open in a new tab.
 */
function StartMenu({ pinned, recent, allPrograms, places, links, system, onLogOff, onTurnOff, onClose }) {
	const menuRef = useRef(null);
	const [isAllProgramsOpen, setIsAllProgramsOpen] = useState(false);

	// Close on any click outside the menu (the Start button handles its own toggle).
	useEffect(() => {
		function onPointerDown(event) {
			if (menuRef.current?.contains(event.target)) return;
			if (event.target.closest?.(".xp-start-button")) return;
			onClose();
		}
		function onKeyDown(event) {
			if (event.key === "Escape") onClose();
		}
		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [onClose]);

	function run(item) {
		onClose();
		if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
		else item.action?.();
	}

	function renderItem(item, size) {
		return (
			<button key={item.label} className={`xp-start-item ${size}`} onClick={() => run(item)}>
				<img src={item.icon} alt="" draggable={false} />
				<span className="xp-start-item-text">
					<span className={item.bold ? "bold" : ""}>{item.label}</span>
					{item.subtitle && <span className="xp-start-item-subtitle">{item.subtitle}</span>}
				</span>
			</button>
		);
	}

	return (
		<div className="xp-start-menu" ref={menuRef}>
			<div className="xp-start-header">
				<img className="xp-start-avatar" src={userConfig.profilePicture} alt="" />
				<span>{userConfig.name}</span>
			</div>

			<div className="xp-start-orange-line" />

			<div className="xp-start-columns">
				<div className="xp-start-left">
					<div className="xp-start-list">{pinned.map((item) => renderItem(item, "large"))}</div>
					<div className="xp-start-separator" />
					<div className="xp-start-list grow">{recent.map((item) => renderItem(item, "large"))}</div>
					<div className="xp-start-separator" />
					<div className="xp-start-all-programs" onMouseEnter={() => setIsAllProgramsOpen(true)} onMouseLeave={() => setIsAllProgramsOpen(false)}>
						<button className="xp-start-all-programs-button" onClick={() => setIsAllProgramsOpen((open) => !open)}>
							<span>All Programs</span>
							<span className="xp-start-green-arrow" />
						</button>
						{isAllProgramsOpen && <div className="xp-start-flyout">{allPrograms.map((item) => renderItem(item, "small"))}</div>}
					</div>
				</div>

				<div className="xp-start-right">
					{places.map((item) => renderItem({ ...item, bold: true }, "medium"))}
					<div className="xp-start-separator blue" />
					{links.map((item) => renderItem(item, "small"))}
					<div className="xp-start-separator blue" />
					{system.map((item) => renderItem(item, "small"))}
				</div>
			</div>

			<div className="xp-start-footer">
				<button
					className="xp-start-footer-button"
					onClick={() => {
						onClose();
						onLogOff();
					}}
				>
					<img src="icons/xp/logoff.svg" alt="" />
					Log Off
				</button>
				<button
					className="xp-start-footer-button"
					onClick={() => {
						onClose();
						onTurnOff();
					}}
				>
					<img src="icons/xp/shutdown.svg" alt="" />
					Turn Off Computer
				</button>
			</div>
		</div>
	);
}

export default StartMenu;
