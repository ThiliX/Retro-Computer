import "./TaskBarAppDisplay.css";

function TaskBarAppDisplay({ appRef }) {
	function handleAppClick(e) {
		e.stopPropagation();
		e.preventDefault();
		// Toggle: if minimized, restore; if visible, minimize
		appRef?.minimize();
	}

	return (
		<div className="task-bar-app-display" onClick={handleAppClick}>
			<div className="task-bar-app-icon-container">
				<img src={appRef?.appearence?.icon} style={{ width: "20px", height: "20px" }} alt="" />
			</div>

			<div className="task-bar-app-title-container">
				<span className="task-bar-app-title">{appRef?.appearence.title}</span>
			</div>
		</div>
	);
}

export default TaskBarAppDisplay;
