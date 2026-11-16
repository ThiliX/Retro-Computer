import React from "react";

import AppCore from "../AppCore";
import TxtRenderer from "./TxtRenderer";

const Txt = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={TxtRenderer}
			iconX={iconX}
			iconY={iconY}
			title="me.txt"
			icon="icons/new-txt.svg"
			width={340}
			height={450}
			backgroundColor="#1a0b1e"
			topBarColor="var(--sa-titlebar)"
			titleColor="var(--sa-cream)"
			ref={ref}
			parentRef={parentRef}
			overflowY="auto"
			{...others}
		/>
	);
});

export default Txt;
