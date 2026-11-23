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
			icon="icons/xp/synth.svg"
			width={450}
			height={310}
			backgroundColor="#1a0b1e"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Synth;
