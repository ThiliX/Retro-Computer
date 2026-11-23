import React from "react";

import AppCore from "../AppCore";
import PaintRenderer from "./PaintRenderer";

const Paint = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={PaintRenderer}
			iconX={iconX}
			iconY={iconY}
			title="untitled - Paint"
			iconTitle="Paint"
			icon="icons/xp/paint.svg"
			width={650}
			height={490}
			backgroundColor="#ece9d8"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Paint;
