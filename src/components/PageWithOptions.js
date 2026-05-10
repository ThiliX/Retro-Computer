import { useState } from "react";

import "./PageWithOptions.css";

function PageWithOptions({ appCoreRef, AppRenderer, options, initialOption, appDisplayRef }) {
	const [currentOption, setCurrentOption] = useState(initialOption);

	function makeOnOptionClickedHandler(option) {
		return () => {
			setCurrentOption(option);
		};
	}

	return (
		<div style={{ width: "calc(100% - 2px)", height: `${appCoreRef.current.appearence.height - 30 - 30 - 2}px` }}>
			<div className="app-options-bar">
				{options.map((option, index) => {
					return (
						<button
							key={index}
							onClick={makeOnOptionClickedHandler(option)}
							className="app-options-button"
							style={
								currentOption === option
									? {
											backgroundColor: "#1a1a2e",
											borderBottom: "2px solid #1a1a2e",
											borderTop: "1px solid #00ff41",
											borderLeft: "1px solid #00ff41",
											borderRight: "1px solid #00ff41",
											zIndex: 50000,
											height: "28px",
											color: "#00ff41",
											textShadow: "0 0 6px rgba(0,255,65,0.4)",
										}
									: {}
							}
						>
							{option}
						</button>
					);
				})}
			</div>

			<div style={{ width: "100%", height: "100%" }}>{AppRenderer[currentOption]({ appRef: appCoreRef })}</div>
		</div>
	);
}

export default PageWithOptions;
