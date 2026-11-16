import { useEffect, useRef, useState } from "react";

import "./BootScreen.css";
import userConfig from "../userConfig";

const TOTAL_MEMORY_KB = 32768;

// Each step appears after `at` ms. The memory counter animates between steps 2 and 3.
const BOOT_LINES = [
	{ at: 150, text: "SUNSET SYSTEMS BIOS v4.51  (C) 1996 Sunset Systems" },
	{ at: 450, text: "586-class CPU at 166 MHz" },
	{ at: 700, text: "MEMORY_TEST" },
	{ at: 1500, text: "Detecting IDE Primary Master ... RETRO-HDD 1.2GB" },
	{ at: 1750, text: "Detecting IDE Primary Slave  ... CD-ROM 8X" },
	{ at: 2000, text: "Floppy Drive A: 1.44MB 3.5in" },
	{ at: 2400, text: "" },
	{ at: 2500, text: `Starting ${userConfig.copyright.replace(/©/g, "").trim() || "Retro"} OS 98...` },
];

const FINISH_AT = 3400;

function BootScreen({ onFinished }) {
	const [visibleCount, setVisibleCount] = useState(0);
	const [memoryKb, setMemoryKb] = useState(0);
	const onFinishedRef = useRef(onFinished);
	onFinishedRef.current = onFinished;

	useEffect(() => {
		const startedAt = performance.now();
		const timeouts = BOOT_LINES.map((line, index) => setTimeout(() => setVisibleCount(index + 1), line.at));

		const memoryStart = BOOT_LINES[2].at;
		const memoryEnd = BOOT_LINES[3].at - 100;
		const memoryInterval = setInterval(() => {
			const elapsed = performance.now() - startedAt;
			const progress = Math.min(Math.max((elapsed - memoryStart) / (memoryEnd - memoryStart), 0), 1);
			setMemoryKb(Math.round((progress * TOTAL_MEMORY_KB) / 64) * 64);
			if (progress >= 1) {
				clearInterval(memoryInterval);
			}
		}, 30);

		const finish = () => onFinishedRef.current();
		timeouts.push(setTimeout(finish, FINISH_AT));

		// Any key or click skips the POST, like hammering ESC on a real machine.
		window.addEventListener("keydown", finish);

		return () => {
			timeouts.forEach(clearTimeout);
			clearInterval(memoryInterval);
			window.removeEventListener("keydown", finish);
		};
	}, []);

	return (
		<div className="boot-screen" onClick={() => onFinishedRef.current()}>
			<div className="boot-screen-logo">
				<span className="boot-screen-sun" />
				<span>SUNSET</span>
			</div>
			{BOOT_LINES.slice(0, visibleCount).map((line, index) => (
				<div key={index} className="boot-screen-line">
					{line.text === "MEMORY_TEST" ? `Memory Test : ${memoryKb}K ${memoryKb === TOTAL_MEMORY_KB ? "OK" : ""}` : line.text || " "}
				</div>
			))}
			<span className="boot-screen-cursor">█</span>
			<div className="boot-screen-footer">Press any key to skip &nbsp;·&nbsp; DEL to enter SETUP</div>
		</div>
	);
}

export default BootScreen;
