import React from "react";

import AppCore from "../AppCore";
import BrowserRenderer from "./BrowserRenderer";

const Browser = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={BrowserRenderer}
			iconX={iconX}
			iconY={iconY}
			title="Internet"
			icon="icons/xp/internet.svg"
			width={640}
			height={440}
			backgroundColor="#ece9d8"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Browser;
