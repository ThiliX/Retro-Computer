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
											backgroundColor: "#2b1233",
											borderBottom: "2px solid #2b1233",
											borderTop: "1px solid #ffb627",
											borderLeft: "1px solid #ffb627",
											borderRight: "1px solid #ffb627",
											zIndex: 50000,
											height: "28px",
											color: "#ffb627",
											textShadow: "0 0 3px rgba(255, 182, 39,0.2)",
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
