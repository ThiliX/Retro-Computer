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

const COLOR_MAP = {
	amber: "#ffb627",
	orange: "#ff7a1a",
	red: "#ff5a4a",
	pink: "#ff2e88",
	cream: "#ffe8c2",
	green: "#33ff66",
	cyan: "#2ec4b6",
	blue: "#4488ff",
	purple: "#bb66ff",
	yellow: "#ffff00",
	white: "#ffffff",
};

const DEFAULT_COLOR = COLOR_MAP.amber;

function TerminalRenderer({ appCoreRef }) {
	const [terminalLog, setTerminalLog] = useState([]);
	const [inputColor, setInputColor] = useState(DEFAULT_COLOR);

	const terminalInput = useRef("");
	const terminalRef = useRef();
	const terminalInputRef = useRef();
	const terminalContainerRef = useRef();
	const historyRef = useRef([]);
	const historyIndexRef = useRef(0);

	function clearTerminal() {
		setTerminalLog(["[SYS] type help to see all commands available."]);
	}

	// Appends lines to the log. Null/false parts are skipped instead of rendering as blank rows.
	function writeToTerminal(input, showDirectory, addLineBreak) {
		const lines = [];
		if (showDirectory) lines.push(`${DIRECTORY} ${terminalInput.current}`);
		if (input !== null && input !== undefined && input !== false) lines.push(input);
		if (addLineBreak) lines.push("\u00a0");
		setTerminalLog((prevState) => [...prevState, ...lines]);
	}

	function setTerminalText(input = "") {
		terminalInputRef.current.value = input;
	}

	function setTerminalColor(colorName) {
		const available = Object.keys(COLOR_MAP).join(", ");
		if (!colorName) {
			writeToTerminal(`Usage: color <name>. Available: ${available}`, false, true);
			return;
		}
		const key = colorName.toLowerCase();
		if (key in COLOR_MAP) {
			setInputColor(COLOR_MAP[key]);
		} else {
			writeToTerminal(`[ERR] Color '${colorName}' not found. Available: ${available}`, false, true);
			window.retroSounds?.playErrorSound();
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
			<div key="welcome" className="terminal-welcome-box">
				<div className="terminal-welcome-line">{userConfig.name}'s RetroPC Terminal</div>
				<div className="terminal-welcome-line">Type 'help' for available commands</div>
			</div>,
			"",
		]);
		terminalInputRef.current?.focus();
	}, []);

	useEffect(() => {
		terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
	}, [terminalLog]);

	// Bound to the input itself, so Enter in other windows never runs terminal commands.
	function onInputKeyDown(event) {
		// Keep keystrokes from reaching global listeners (e.g. the synth keyboard).
		event.stopPropagation();

		const history = historyRef.current;
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			if (!history.length) return;
			const delta = event.key === "ArrowUp" ? -1 : 1;
			historyIndexRef.current = Math.min(Math.max(historyIndexRef.current + delta, 0), history.length);
			setTerminalText(history[historyIndexRef.current] ?? "");
			return;
		}

		if (event.key !== "Enter") {
			return;
		}

		const input = terminalInputRef.current.value.trim();
		terminalInput.current = input;

		if (input) {
			history.push(input);
			historyIndexRef.current = history.length;
		}

		const command = input.split(/\s+/)[0].toLowerCase();
		if (!command) {
			writeToTerminal(null, true, false);
		} else if (command in commands) {
			writeToTerminal(null, true, false);
			commands[command].exec(terminalRef, input);
		} else {
			writeToTerminal(`[ERR] Unknown command: '${command}'. Type 'help' for available commands.`, true, true);
			window.retroSounds?.playErrorSound();
		}

		setTerminalText();
	}

	return (
		<div className="terminal-renderer-container" ref={terminalContainerRef} onClick={() => terminalInputRef.current?.focus()}>
			{terminalLog.map((line, index) => (
				<div style={{ color: inputColor, fontSize: "18px", lineHeight: "1.4" }} key={index}>
					{line}
				</div>
			))}

			<div className="input-container">
				<span className="fixed-text" style={{ color: inputColor }}>
					{DIRECTORY}&nbsp;
				</span>
				<input
					className="terminal-input"
					ref={terminalInputRef}
					style={{ color: inputColor, caretColor: inputColor }}
					onKeyDown={onInputKeyDown}
					onKeyUp={(event) => event.stopPropagation()}
					spellCheck={false}
					autoComplete="off"
				></input>
			</div>
		</div>
	);
}

export default TerminalRenderer;
