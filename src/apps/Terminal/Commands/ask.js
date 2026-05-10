const userConfig = require("../../../userConfig").default;

const label = "type ask and the number. Ex: ask 1";

module.exports = {
	name: "ask",
	description: "List of questions you can ask in the terminal",
	exec: (terminalRef, input) => {
		const questions = userConfig.terminalQA;
		if (input.trim() === "ask") {
			terminalRef.current.writeToTerminal(label, false, true);
			for (let index = 0; index < questions.length; index++) {
				terminalRef.current.writeToTerminal(`${index + 1}. ${questions[index].question}`, false, false);
			}

			terminalRef.current.writeToTerminal(null, false, true);
		} else {
			const index = Number(input.split(" ")[1]);
			if (index - 1 < questions.length && index >= 1) {
				terminalRef.current.writeToTerminal(`> ${questions[index - 1].answer}`, false, true);
			} else {
				terminalRef.current.writeToTerminal("[ERR] This question number doesn't exist.", false, true);
				if (window.retroSounds) window.retroSounds.playErrorSound();
			}
		}
	},
};
