import React from "react";

import AppCore from "../AppCore";

import MyPcConfigRenderer from "./Pages/MyPcConfigRenderer";
import MyPcSetupRenderer from "./Pages/MyPcSetupRenderer";
import MyPcSleeperRenderer from "./Pages/MyPcSleeperRenderer";

const MyPc = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={{
				General: MyPcConfigRenderer,
				Hardware: MyPcSetupRenderer,
				Power: MyPcSleeperRenderer,
			}}
			iconX={iconX}
			iconY={iconY}
			title="System Properties"
			iconTitle="My Computer"
			icon="icons/xp/My computer.ico"
			width={420}
			height={470}
			backgroundColor="#ece9d8"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			options={["General", "Hardware", "Power"]}
			initialOption="General"
			{...others}
		/>
	);
});

export default MyPc;
