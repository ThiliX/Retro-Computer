import "./IconDisplay.css";

import { useDesktopSelection } from "../context/DesktopSelectionContext";

export const ICON_CELL_WIDTH = 78;
export const ICON_CELL_HEIGHT = 76;
const DESKTOP_PADDING = 6;

/**
 * XP desktop icon: click selects, double-click (or Enter) opens.
 * `x` / `y` are grid cells; App lays the icons out top-to-bottom, left-to-right.
 */
function IconDisplay({ icon, title, href, x, y, onIconClicked, isShortcut }) {
	const { selectedIcon, selectIcon } = useDesktopSelection();
	const isSelected = selectedIcon === title;

	function open() {
		if (href) {
			window.open(href, "_blank", "noopener,noreferrer");
		} else {
			onIconClicked?.();
		}
	}

	return (
		<div
			className={`xp-desktop-icon ${isSelected ? "selected" : ""}`}
			style={{ left: `${DESKTOP_PADDING + x * ICON_CELL_WIDTH}px`, top: `${DESKTOP_PADDING + y * ICON_CELL_HEIGHT}px` }}
			onMouseDown={(event) => {
				event.stopPropagation();
				selectIcon(title);
			}}
			onDoubleClick={open}
			onKeyDown={(event) => event.key === "Enter" && open()}
			tabIndex={0}
			role="button"
			aria-label={title}
		>
			<div className="xp-desktop-icon-image">
				<img src={icon} alt="" draggable={false} />
				{isShortcut && <img className="xp-desktop-icon-shortcut" src="icons/xp/shortcut.svg" alt="" draggable={false} />}
			</div>
			<span className="xp-desktop-icon-label">{title}</span>
		</div>
	);
}

export default IconDisplay;
