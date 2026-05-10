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
			<div className="task-bar-app-icon-container" style={{ pointerEvents: 'none' }}>
				<img src={appRef?.appearence?.icon} style={{ width: "20px", height: "20px", pointerEvents: 'pointer' }} alt="" />
			</div>

			<div className="task-bar-app-title-container" style={{ pointerEvents: 'pointer' }}>
				<span className="task-bar-app-title" style={{ pointerEvents: 'pointer' }}>{appRef?.appearence.title}</span>
			</div>
		</div>
	);
}

export default TaskBarAppDisplay;
