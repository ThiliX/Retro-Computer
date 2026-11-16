import React from "react";

import AppCore from "../AppCore";
import TerminalRenderer from "./TerminalRenderer";

const Terminal = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
            AppRenderer={TerminalRenderer}
			iconX={iconX}
			iconY={iconY}
			title="terminal"
			icon="icons/new-cmd.svg"
			width={580}
			height={350}
			backgroundColor="#140812"
			topBarColor="var(--sa-titlebar)"
			titleColor="var(--sa-cream)"
			ref={ref}
            parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Terminal;
