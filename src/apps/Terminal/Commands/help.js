module.exports = {
	name: "help",
	description: "List all available commands",
	exec: (terminalRef) => {
		for (const value of Object.values(terminalRef.current.commands)) {
			terminalRef.current.writeToTerminal(`${value.name} - ${value.description}`, false, false);
		}

		terminalRef.current.writeToTerminal(null, false, true);
	},
};
