import React from "react";

import AppCore from "../AppCore";
import SynthRenderer from "./SynthRenderer";

const Synth = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={SynthRenderer}
			iconX={iconX}
			iconY={iconY}
			title="Synth-80"
			icon="icons/new-synth.svg"
			width={450}
			height={310}
			backgroundColor="#0a0a15"
			topBarColor="#1a0033"
			titleColor="#ff00ff"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Synth;
