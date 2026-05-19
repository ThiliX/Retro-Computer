import React from "react";

import AppCore from "../AppCore";
import KittRenderer from "./KittRenderer";

const Kitt = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={KittRenderer}
			iconX={iconX}
			iconY={iconY}
			title="K.I.T.T."
			icon="icons/new-kitt.svg"
			width={550}
			height={340}
			backgroundColor="#0a0a0a"
			topBarColor="#1a0000"
			titleColor="#ff2222"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Kitt;
