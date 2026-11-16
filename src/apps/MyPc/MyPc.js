import React from "react";

import AppCore from "../AppCore";

import MyPcConfigRenderer from "./Pages/MyPcConfigRenderer";
import MyPcSetupRenderer from "./Pages/MyPcSetupRenderer";
import MyPcSleeperRenderer from "./Pages/MyPcSleeperRenderer";

const MyPc = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={{
				config: MyPcConfigRenderer,
				setup: MyPcSetupRenderer,
				sleeper: MyPcSleeperRenderer,
			}}
			iconX={iconX}
			iconY={iconY}
			title="myPc"
			icon="icons/new-pc.svg"
			width={600}
			height={450}
			backgroundColor="#2b1233"
			topBarColor="var(--sa-titlebar)"
			titleColor="var(--sa-cream)"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			options={["config", "setup", "sleeper"]}
			initialOption="config"
			{...others}
		/>
	);
});

export default MyPc;
