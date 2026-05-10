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

export default Browser;
