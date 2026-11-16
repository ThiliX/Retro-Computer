import React from "react";

import AppCore from "../AppCore";
import BrowserRenderer from "./BrowserRenderer";

const Browser = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={BrowserRenderer}
			iconX={iconX}
			iconY={iconY}
			title="netscape"
			icon="icons/explorer.png"
			width={530}
			height={350}
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

export default Browser;
