import "./TaskBarAppDisplay.css";

import { useAppsManager } from "../context/AppsManagerContext";

/**
 * Taskbar button. Like XP: clicking the active window minimizes it, clicking a
 * background window brings it forward, clicking a minimized one restores it.
 */
function TaskBarAppDisplay({ appRef, isMinimized }) {
	const { focusedApp, focusApp } = useAppsManager();
	const isActive = !isMinimized && focusedApp === appRef?.appDisplayRef;

	function handleAppClick(e) {
		e.stopPropagation();
		e.preventDefault();
		if (!appRef) return;

		if (appRef.isMinimized() || isActive) {
			appRef.minimize();
		} else {
			focusApp(appRef.appDisplayRef);
		}
	}

	return (
		<button className={`xp-task-button ${isActive ? "active" : ""}`} onClick={handleAppClick} title={appRef?.appearence?.title}>
			<img src={appRef?.appearence?.icon} alt="" draggable={false} />
			<span>{appRef?.appearence.title}</span>
		</button>
	);
}

export default TaskBarAppDisplay;
