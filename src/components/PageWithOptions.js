import { useState } from "react";

import "./PageWithOptions.css";

/** XP property-sheet tabs: a row of tabs above a white panel. */
function PageWithOptions({ appCoreRef, AppRenderer, options, initialOption }) {
	const [currentOption, setCurrentOption] = useState(initialOption);
	const Page = AppRenderer[currentOption];

	return (
		<div className="xp-tabs">
			<div className="xp-tab-row" role="tablist">
				{options.map((option) => (
					<button key={option} role="tab" aria-selected={currentOption === option} className={`xp-tab ${currentOption === option ? "selected" : ""}`} onClick={() => setCurrentOption(option)}>
						{option}
					</button>
				))}
			</div>
			<div className="xp-tab-panel">
				<Page appRef={appCoreRef} />
			</div>
		</div>
	);
}

export default PageWithOptions;
