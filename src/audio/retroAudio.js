/**
 * Retro PC sound engine.
 *
 * Real machines sound noisy and mechanical, so most effects here are shaped
 * noise bursts (clicks, steppers, fans) instead of plain beeping oscillators.
 * Everything goes through one master bus with a low-pass "room" filter, which
 * lets the 3D view muffle the PC when the camera is across the room.
 */

let ctx = null;
let master = null;
let roomFilter = null;
let whiteNoise = null;
let brownNoise = null;
let ambience = null;

function getContext() {
	if (!ctx) {
		const AudioCtx = window.AudioContext || window.webkitAudioContext;
		if (!AudioCtx) return null;
		ctx = new AudioCtx();

		roomFilter = ctx.createBiquadFilter();
		roomFilter.type = "lowpass";
		roomFilter.frequency.value = 14000;
		roomFilter.Q.value = 0.5;

		master = ctx.createGain();
		master.gain.value = 0.9;

		master.connect(roomFilter);
		roomFilter.connect(ctx.destination);
	}
	if (ctx.state === "suspended") {
		ctx.resume();
	}
	return ctx;
}

function getWhiteNoise(audio) {
	if (!whiteNoise) {
		const length = audio.sampleRate * 2;
		whiteNoise = audio.createBuffer(1, length, audio.sampleRate);
		const data = whiteNoise.getChannelData(0);
		for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
	}
	return whiteNoise;
}

function getBrownNoise(audio) {
	if (!brownNoise) {
		const length = audio.sampleRate * 4;
		brownNoise = audio.createBuffer(1, length, audio.sampleRate);
		const data = brownNoise.getChannelData(0);
		let last = 0;
		for (let i = 0; i < length; i++) {
			last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
			data[i] = last * 3.5;
		}
	}
	return brownNoise;
}

function safely(fn) {
	return (...args) => {
		try {
			const audio = getContext();
			if (audio) fn(audio, ...args);
		} catch (e) {
			/* audio is decoration — never break the app over it */
		}
	};
}

// One filtered noise burst with a fast attack and exponential decay.
function noiseBurst(audio, { start = 0, duration = 0.02, type = "bandpass", freq = 2000, q = 1, gain = 0.3, attack = 0.001, destination = master }) {
	const t = audio.currentTime + start;
	const source = audio.createBufferSource();
	source.buffer = getWhiteNoise(audio);
	source.playbackRate.value = 0.9 + Math.random() * 0.2;

	const filter = audio.createBiquadFilter();
	filter.type = type;
	filter.frequency.value = freq;
	filter.Q.value = q;

	const env = audio.createGain();
	env.gain.setValueAtTime(0.0001, t);
	env.gain.linearRampToValueAtTime(gain, t + attack);
	env.gain.exponentialRampToValueAtTime(0.0001, t + attack + duration);

	source.connect(filter);
	filter.connect(env);
	env.connect(destination);
	source.start(t, Math.random() * 1.5);
	source.stop(t + attack + duration + 0.05);
}

function tone(audio, { start = 0, type = "sine", from, to, duration, gain, attack = 0.005, destination = master }) {
	const t = audio.currentTime + start;
	const osc = audio.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(from, t);
	if (to) osc.frequency.exponentialRampToValueAtTime(to, t + duration);

	const env = audio.createGain();
	env.gain.setValueAtTime(0.0001, t);
	env.gain.linearRampToValueAtTime(gain, t + attack);
	env.gain.exponentialRampToValueAtTime(0.0001, t + attack + duration);

	osc.connect(env);
	env.connect(destination);
	osc.start(t);
	osc.stop(t + attack + duration + 0.05);
}

/** Mouse button: a tiny press click and a softer release click. */
export const playClick = safely((audio) => {
	noiseBurst(audio, { duration: 0.008, freq: 3200, q: 2.5, gain: 0.22 });
	noiseBurst(audio, { start: 0.055, duration: 0.006, freq: 2400, q: 2.5, gain: 0.12 });
});

/** Mechanical key: a bright tick on top of a low "thock". */
export const playKey = safely((audio) => {
	const pitch = 0.85 + Math.random() * 0.3;
	noiseBurst(audio, { duration: 0.018, freq: 1800 * pitch, q: 1.4, gain: 0.16 });
	tone(audio, { from: 190 * pitch, to: 120 * pitch, duration: 0.03, gain: 0.07 });
});

/** Chunky rocker power switch. */
export const playPowerSwitch = safely((audio, isTurningOn) => {
	noiseBurst(audio, { duration: 0.035, type: "lowpass", freq: isTurningOn ? 1400 : 1000, q: 0.7, gain: 0.55 });
	tone(audio, { from: 110, to: 45, duration: 0.09, gain: 0.25 });
	noiseBurst(audio, { start: 0.04, duration: 0.02, freq: 2600, q: 2, gain: 0.18 });
});

/** CRT warming up: a low "bwoom" as the tube energises, plus a faint flyback whine. */
export const playCrtPowerOn = safely((audio) => {
	tone(audio, { from: 48, to: 70, duration: 0.7, gain: 0.22, attack: 0.04 });
	noiseBurst(audio, { duration: 0.5, type: "lowpass", freq: 220, q: 0.8, gain: 0.25, attack: 0.03 });
	tone(audio, { start: 0.1, from: 15600, duration: 1.6, gain: 0.006, attack: 0.3 });
});

/** CRT switching off: the picture collapses with a soft electric pop. */
export const playCrtPowerOff = safely((audio) => {
	noiseBurst(audio, { duration: 0.12, type: "highpass", freq: 3500, q: 0.6, gain: 0.08 });
	tone(audio, { from: 90, to: 30, duration: 0.25, gain: 0.12 });
});

/** The single PC-speaker beep that means POST passed. */
export const playPostBeep = safely((audio) => {
	const t = audio.currentTime;
	const osc = audio.createOscillator();
	osc.type = "square";
	osc.frequency.value = 1000;
	const soften = audio.createBiquadFilter();
	soften.type = "lowpass";
	soften.frequency.value = 2800;
	const env = audio.createGain();
	env.gain.setValueAtTime(0.0001, t);
	env.gain.linearRampToValueAtTime(0.06, t + 0.005);
	env.gain.setValueAtTime(0.06, t + 0.16);
	env.gain.linearRampToValueAtTime(0.0001, t + 0.18);
	osc.connect(soften);
	soften.connect(env);
	env.connect(master);
	osc.start(t);
	osc.stop(t + 0.2);
});

/** Floppy drive: motor whirr with the stepper head ticking across the disk. */
export const playFloppySeek = safely((audio, duration = 0.8) => {
	const t = audio.currentTime;
	const motor = audio.createOscillator();
	motor.type = "sawtooth";
	motor.frequency.value = 42;
	const motorFilter = audio.createBiquadFilter();
	motorFilter.type = "lowpass";
	motorFilter.frequency.value = 260;
	const motorGain = audio.createGain();
	motorGain.gain.setValueAtTime(0.0001, t);
	motorGain.gain.linearRampToValueAtTime(0.05, t + 0.08);
	motorGain.gain.setValueAtTime(0.05, t + duration - 0.1);
	motorGain.gain.linearRampToValueAtTime(0.0001, t + duration);
	motor.connect(motorFilter);
	motorFilter.connect(motorGain);
	motorGain.connect(master);
	motor.start(t);
	motor.stop(t + duration + 0.05);

	let at = 0.06;
	while (at < duration - 0.05) {
		noiseBurst(audio, { start: at, duration: 0.012, freq: 700 + Math.random() * 300, q: 3, gain: 0.2 });
		at += Math.random() < 0.25 ? 0.09 : 0.028;
	}
});

/** Hard disk seeking: sparse, quick, high clicks. */
export const playHddChatter = safely((audio, duration = 0.5) => {
	let at = 0;
	while (at < duration) {
		noiseBurst(audio, { start: at, duration: 0.004, type: "highpass", freq: 2800, q: 0.8, gain: 0.12 + Math.random() * 0.08 });
		at += 0.018 + Math.random() * 0.07;
	}
});

/** Startup jingle: a slow, warm arpeggio with a little echo. */
export const playStartupChime = safely((audio) => {
	const echo = audio.createDelay();
	echo.delayTime.value = 0.28;
	const feedback = audio.createGain();
	feedback.gain.value = 0.32;
	const wet = audio.createGain();
	wet.gain.value = 0.35;
	echo.connect(feedback);
	feedback.connect(echo);
	echo.connect(wet);
	wet.connect(master);

	const bus = audio.createGain();
	bus.gain.value = 1;
	bus.connect(master);
	bus.connect(echo);

	// Cmaj9 spread out, then a high bell on top.
	const notes = [261.63, 329.63, 392.0, 493.88, 587.33];
	notes.forEach((freq, i) => {
		tone(audio, { start: i * 0.16, type: "triangle", from: freq, duration: 1.8 - i * 0.15, gain: 0.07, attack: 0.04, destination: bus });
		tone(audio, { start: i * 0.16, type: "sine", from: freq * 1.003, duration: 1.6 - i * 0.15, gain: 0.04, attack: 0.04, destination: bus });
	});
	tone(audio, { start: 0.85, type: "sine", from: 1046.5, duration: 1.4, gain: 0.05, attack: 0.01, destination: bus });
	tone(audio, { start: 0.85, type: "sine", from: 2888, duration: 0.6, gain: 0.012, attack: 0.01, destination: bus });
	tone(audio, { start: 0, type: "sine", from: 130.81, duration: 2.2, gain: 0.08, attack: 0.25, destination: bus });
});

/** Error "bonk": a soft, low, filtered buzz rather than a harsh beep. */
export const playError = safely((audio) => {
	const t = audio.currentTime;
	const osc = audio.createOscillator();
	osc.type = "square";
	osc.frequency.setValueAtTime(220, t);
	osc.frequency.setValueAtTime(165, t + 0.09);
	const filter = audio.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 1100;
	const env = audio.createGain();
	env.gain.setValueAtTime(0.0001, t);
	env.gain.linearRampToValueAtTime(0.12, t + 0.008);
	env.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
	osc.connect(filter);
	filter.connect(env);
	env.connect(master);
	osc.start(t);
	osc.stop(t + 0.3);
});

/** Constant PC fan + mains hum while the computer is on. */
export const setAmbience = safely((audio, isOn) => {
	const t = audio.currentTime;
	if (isOn && !ambience) {
		const fan = audio.createBufferSource();
		fan.buffer = getBrownNoise(audio);
		fan.loop = true;
		const fanFilter = audio.createBiquadFilter();
		fanFilter.type = "lowpass";
		fanFilter.frequency.value = 480;
		const hum = audio.createOscillator();
		hum.frequency.value = 120;
		const humGain = audio.createGain();
		humGain.gain.value = 0.05;
		const out = audio.createGain();
		out.gain.setValueAtTime(0.0001, t);
		out.gain.linearRampToValueAtTime(0.08, t + 1.5);

		fan.connect(fanFilter);
		fanFilter.connect(out);
		hum.connect(humGain);
		humGain.connect(out);
		out.connect(master);
		fan.start(t);
		hum.start(t);
		ambience = { fan, hum, out };
	} else if (!isOn && ambience) {
		const { fan, hum, out } = ambience;
		out.gain.cancelScheduledValues(t);
		out.gain.setValueAtTime(out.gain.value, t);
		out.gain.linearRampToValueAtTime(0.0001, t + 1.2);
		fan.stop(t + 1.3);
		hum.stop(t + 1.3);
		ambience = null;
	}
});

/**
 * Muffle everything when the listener is across the room (3D view) and open it
 * up when they sit at the desk.
 */
export function setListenerNear(isNear) {
	if (!ctx || !roomFilter) return;
	const t = ctx.currentTime;
	roomFilter.frequency.cancelScheduledValues(t);
	roomFilter.frequency.setTargetAtTime(isNear ? 14000 : 1100, t, 0.25);
	master.gain.cancelScheduledValues(t);
	master.gain.setTargetAtTime(isNear ? 0.9 : 0.55, t, 0.25);
}

/** Modern PC: a soft tactile button, then fans whooshing up to speed. */
export const playModernPowerOn = safely((audio) => {
	noiseBurst(audio, { duration: 0.012, freq: 3800, q: 2, gain: 0.18 });
	noiseBurst(audio, { start: 0.07, duration: 0.01, freq: 2600, q: 2, gain: 0.1 });

	const t = audio.currentTime + 0.1;
	const fans = audio.createBufferSource();
	fans.buffer = getBrownNoise(audio);
	const sweep = audio.createBiquadFilter();
	sweep.type = "bandpass";
	sweep.Q.value = 0.9;
	sweep.frequency.setValueAtTime(120, t);
	sweep.frequency.exponentialRampToValueAtTime(900, t + 1.1);
	sweep.frequency.exponentialRampToValueAtTime(420, t + 2.2);
	const env = audio.createGain();
	env.gain.setValueAtTime(0.0001, t);
	env.gain.linearRampToValueAtTime(0.35, t + 0.6);
	env.gain.linearRampToValueAtTime(0.0001, t + 2.4);
	fans.connect(sweep);
	sweep.connect(env);
	env.connect(master);
	fans.start(t, Math.random());
	fans.stop(t + 2.5);

	// tiny two-note "ready" blip, like a modern motherboard
	tone(audio, { start: 0.35, type: "sine", from: 880, duration: 0.09, gain: 0.04 });
	tone(audio, { start: 0.47, type: "sine", from: 1318.5, duration: 0.14, gain: 0.04 });
});

/** Modern PC shutting down: fans winding down. */
export const playModernPowerOff = safely((audio) => {
	noiseBurst(audio, { duration: 0.012, freq: 3200, q: 2, gain: 0.15 });
	const t = audio.currentTime;
	const fans = audio.createBufferSource();
	fans.buffer = getBrownNoise(audio);
	const sweep = audio.createBiquadFilter();
	sweep.type = "bandpass";
	sweep.Q.value = 0.9;
	sweep.frequency.setValueAtTime(500, t);
	sweep.frequency.exponentialRampToValueAtTime(90, t + 1.4);
	const env = audio.createGain();
	env.gain.setValueAtTime(0.25, t);
	env.gain.linearRampToValueAtTime(0.0001, t + 1.5);
	fans.connect(sweep);
	sweep.connect(env);
	env.connect(master);
	fans.start(t, Math.random());
	fans.stop(t + 1.6);
});

let rain = null;

/**
 * Soft rain against the window. Routed straight to the speakers (not through the
 * room filter) because it belongs to the room, not to the PC.
 */
export const setRain = safely((audio, isOn) => {
	const t = audio.currentTime;
	if (isOn && !rain) {
		const wash = audio.createBufferSource();
		wash.buffer = getWhiteNoise(audio);
		wash.loop = true;
		const washFilter = audio.createBiquadFilter();
		washFilter.type = "bandpass";
		washFilter.frequency.value = 1400;
		washFilter.Q.value = 0.4;

		const rumble = audio.createBufferSource();
		rumble.buffer = getBrownNoise(audio);
		rumble.loop = true;
		const rumbleGain = audio.createGain();
		rumbleGain.gain.value = 0.5;

		const out = audio.createGain();
		out.gain.setValueAtTime(0.0001, t);
		out.gain.linearRampToValueAtTime(0.035, t + 3);

		wash.connect(washFilter);
		washFilter.connect(out);
		rumble.connect(rumbleGain);
		rumbleGain.connect(out);
		out.connect(audio.destination);
		wash.start(t);
		rumble.start(t);

		// occasional heavier drops tapping the glass
		const dropTimer = setInterval(() => {
			if (Math.random() < 0.5) return; // irregular, not a metronome
			try {
				const drop = audio.createGain();
				drop.gain.value = 1;
				drop.connect(audio.destination);
				noiseBurst(audio, { duration: 0.01, freq: 2000 + Math.random() * 2500, q: 4, gain: 0.03 + Math.random() * 0.03, destination: drop });
			} catch (e) {
				/* ignore */
			}
		}, 180);

		rain = { wash, rumble, out, dropTimer };
	} else if (!isOn && rain) {
		const { wash, rumble, out, dropTimer } = rain;
		clearInterval(dropTimer);
		out.gain.cancelScheduledValues(t);
		out.gain.setValueAtTime(out.gain.value, t);
		out.gain.linearRampToValueAtTime(0.0001, t + 1);
		wash.stop(t + 1.1);
		rumble.stop(t + 1.1);
		rain = null;
	}
});
