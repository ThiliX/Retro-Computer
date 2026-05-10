import React from "react";

import AppCore from "../AppCore";
import IERenderer from "./IERenderer";

const InternetExplorer = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={IERenderer}
			iconX={iconX}
			iconY={iconY}
			title="internet explorer"
			icon="icons/explorer.png"
			width={600}
			height={400}
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

export default InternetExplorer;
