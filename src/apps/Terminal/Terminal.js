import React from "react";

import AppCore from "../AppCore";
import TerminalRenderer from "./TerminalRenderer";

const Terminal = React.forwardRef(({ iconX, iconY, parentRef, ...others }, ref) => {
	return (
		<AppCore
            AppRenderer={TerminalRenderer}
			iconX={iconX}
			iconY={iconY}
			title="Command Prompt"
			icon="icons/xp/cmd.svg"
			width={600}
			height={360}
			backgroundColor="#000"
			ref={ref}
            parentRef={parentRef}
			overflowY="hidden"
			{...others}
		/>
	);
});

export default Terminal;
