import { useState, useEffect } from "react";

import "./Clock.css";

/** System-tray clock: "3:07 PM", with the full date as a tooltip. */
function Clock() {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(interval);
	}, []);

	const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
	const date = now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

	return (
		<span className="xp-tray-clock" title={date}>
			{time}
		</span>
	);
}

export default Clock;
