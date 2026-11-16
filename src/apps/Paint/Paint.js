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
			icon="icons/new-paint.svg"
			width={650}
			height={490}
			backgroundColor="#1a0b1e"
			topBarColor="var(--sa-titlebar)"
			titleColor="var(--sa-cream)"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Paint;
