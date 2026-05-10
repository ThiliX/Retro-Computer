import React, { useState, useEffect, useRef, useImperativeHandle } from "react";

import "./TerminalRenderer.css";

import help from "./Commands/help";
import ask from "./Commands/ask";
import cls from "./Commands/cls";
import color from "./Commands/color";
import exit from "./Commands/exit";
import userConfig from "../../userConfig";

const commands = {
	[help.name]: help,
	[ask.name]: ask,
	[cls.name]: cls,
	[color.name]: color,
	[exit.name]: exit,
};

const DIRECTORY = `C:\\Users\\${userConfig.terminalUser}>`;

function TerminalRenderer({ appCoreRef }) {

	const [terminalLog, setTerminalLog] = useState([]);
	const [inputColor, setInputColor] = useState("#00ff41");

	const terminalInput = useRef();
	const terminalRef = useRef();
	const terminalInputRef = useRef();
	const terminalContainerRef = useRef();

	function clearTerminal() {
		setTerminalLog(["[SYS] type help to see all commands available."]);
	}

	function writeToTerminal(input, showDirectory, addLineBreak) {
		setTerminalLog((prevState) => {
			return [...prevState, showDirectory && `${DIRECTORY} ${terminalInput.current}`, input, addLineBreak && "ㅤ"];
		});
	}

	function setTerminalText(input = "") {
		terminalInputRef.current.value = input;
	}

	function setTerminalColor(color) {
		const colorMap = {
			red: "#ff4444",
			green: "#00ff41",
			blue: "#4488ff",
			purple: "#bb66ff",
			pink: "#ff66aa",
			white: "#ffffff",
			yellow: "#ffff00",
			cyan: "#00e5ff",
			amber: "#ffb000",
		};
		if (color in colorMap) {
			setInputColor(colorMap[color]);
		} else {
			writeToTerminal(`[ERR] Color '${color}' not found. Available: ${Object.keys(colorMap).join(", ")}`, false, true);
			if (window.retroSounds) window.retroSounds.playErrorSound();
		}
	}

	useImperativeHandle(terminalRef, () => ({
		ref: terminalInputRef,
		appCoreRef: appCoreRef,
		commands: commands,
		clearTerminal: clearTerminal,
		writeToTerminal: writeToTerminal,
		setTerminalText: setTerminalText,
		setTerminalColor: setTerminalColor,
	}));

	useEffect(() => {
		setTerminalLog([
			"╔══════════════════════════════════════════╗",
			`║  ${userConfig.name}'s RetroPC Terminal             ║`,
			"║  Type 'help' for available commands      ║",
			"╚══════════════════════════════════════════╝",
			"",
		]);
	}, []);

	useEffect(() => {
		terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
	}, [terminalLog]);

	useEffect(() => {
		if (terminalInputRef.current) {
			function onKeyDown(event) {
				if (event.key !== "Enter") {
					return;
				}

				const input = terminalInputRef.current.value;
				terminalInput.current = input;

				const command = input.split(" ")[0];
				if (command in commands) {
					writeToTerminal(null, true, false);
					commands[command].exec(terminalRef, input);
				} else {
					writeToTerminal(`[ERR] Unknown command: '${command}'. Type 'help' for available commands.`, true, true);
					if (window.retroSounds) window.retroSounds.playErrorSound();
				}

				setTerminalText();
			}

			// Focus the terminal input when the terminal is opened
			terminalInputRef.current.focus();

			window.addEventListener("keydown", onKeyDown);
			return () => {
				window.removeEventListener("keydown", onKeyDown);
			};
		}
	}, [terminalInputRef]);

	return (
		<div className="terminal-renderer-container" ref={terminalContainerRef}>
			{terminalLog.map((line, index) => (
				<div style={{ color: inputColor, fontSize: "18px", lineHeight: "1.4" }} key={index}>
					{line}
				</div>
			))}

			<div className="input-container">
				<span className="fixed-text" style={{ color: inputColor }}>
					{DIRECTORY}&nbsp;
				</span>
				<input className="terminal-input" ref={terminalInputRef} style={{ color: inputColor }}></input>
			</div>
		</div>
	);
}

export default TerminalRenderer;
