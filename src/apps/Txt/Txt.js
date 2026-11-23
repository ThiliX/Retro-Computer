import React from "react";

import AppCore from "../AppCore";
import TxtRenderer from "./TxtRenderer";

const Txt = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
			AppRenderer={TxtRenderer}
			iconX={iconX}
			iconY={iconY}
			title="About Me.txt - Notepad"
			iconTitle="About Me.txt"
			icon="icons/xp/notepad.svg"
			width={440}
			height={420}
			backgroundColor="#fff"
			ref={ref}
			parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Txt;
