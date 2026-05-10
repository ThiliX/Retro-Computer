import React from "react";

import AppCore from "../AppCore";
import PaintRenderer from "./PaintRenderer";

const Paint = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={PaintRenderer}
			iconX={iconX}
			iconY={iconY}
			title="pixelart"
			icon="icons/paint.png"
			width={400}
			height={490}
			backgroundColor="#0a0a15"
			topBarColor="#003300"
			titleColor="#00ff41"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Paint;
