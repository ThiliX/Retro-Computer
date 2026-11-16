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
			backgroundColor="#1a0b1e"
			topBarColor="linear-gradient(90deg, #2b0f1f 0%, #8c1c3a 50%, #ff2e88 100%)"
			titleColor="var(--sa-cream)"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Synth;
