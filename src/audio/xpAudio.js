/**
 * XP-era system sounds, synthesized live with the Web Audio API.
 *
 * These are original compositions in the spirit of early-2000s desktop sounds
 * (warm pads, glassy bells, soft "pops"), not copies of any shipped audio file,
 * so the project carries no third-party sound assets.
 */

let ctx = null;
let master = null;
let reverbSend = null;

function getContext() {
	if (ctx) {
		if (ctx.state === "suspended") ctx.resume();
		return ctx;
	}

	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (!AudioContext) return null;

	ctx = new AudioContext();

	master = ctx.createGain();
	master.gain.value = 0.55;

	// gentle glue so stacked bells never clip
	const compressor = ctx.createDynamicsCompressor();
	compressor.threshold.value = -14;
	compressor.ratio.value = 3;
	master.connect(compressor).connect(ctx.destination);

	// small hall built from a decaying noise burst
	const reverb = ctx.createConvolver();
	reverb.buffer = createImpulse(2.6, 2.4);
	reverbSend = ctx.createGain();
	reverbSend.gain.value = 0.32;
	reverbSend.connect(reverb).connect(master);

	return ctx;
}

function createImpulse(seconds, decay) {
	const rate = ctx.sampleRate;
	const length = Math.floor(rate * seconds);
	const impulse = ctx.createBuffer(2, length, rate);
	for (let channel = 0; channel < 2; channel++) {
		const data = impulse.getChannelData(channel);
		for (let i = 0; i < length; i++) {
			data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		}
	}
	return impulse;
}

function noteToHz(midi) {
	return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Route a node to the dry mix and (optionally) the reverb. */
function output(node, wet = 1) {
	node.connect(master);
	if (wet > 0) {
		const send = ctx.createGain();
		send.gain.value = wet;
		node.connect(send).connect(reverbSend);
	}
}

/** Glassy bell: a few inharmonic sine partials with exponential decay. */
function bell(midi, start, { volume = 0.18, length = 1.6, wet = 1, brightness = 1 } = {}) {
	const freq = noteToHz(midi);
	const partials = [
		[1, 1],
		[2.0, 0.35 * brightness],
		[3.01, 0.12 * brightness],
		[4.2, 0.06 * brightness],
	];
	const bus = ctx.createGain();
	bus.gain.setValueAtTime(0.0001, start);
	bus.gain.exponentialRampToValueAtTime(volume, start + 0.008);
	bus.gain.exponentialRampToValueAtTime(0.0001, start + length);
	output(bus, wet);

	for (const [ratio, amp] of partials) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = freq * ratio;
		gain.gain.value = amp;
		osc.connect(gain).connect(bus);
		osc.start(start);
		osc.stop(start + length + 0.05);
	}
}

/** Soft synth pad: detuned saws through a slowly opening low-pass filter. */
function pad(midis, start, { volume = 0.07, attack = 0.6, hold = 1.5, release = 1.8, cutoff = 1800 } = {}) {
	const end = start + attack + hold + release;
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.Q.value = 0.7;
	filter.frequency.setValueAtTime(cutoff * 0.25, start);
	filter.frequency.linearRampToValueAtTime(cutoff, start + attack + hold * 0.5);
	filter.frequency.linearRampToValueAtTime(cutoff * 0.3, end);

	const bus = ctx.createGain();
	bus.gain.setValueAtTime(0.0001, start);
	bus.gain.linearRampToValueAtTime(volume, start + attack);
	bus.gain.setValueAtTime(volume, start + attack + hold);
	bus.gain.exponentialRampToValueAtTime(0.0001, end);
	filter.connect(bus);
	output(bus, 0.8);

	for (const midi of midis) {
		for (const detune of [-7, 7]) {
			const osc = ctx.createOscillator();
			osc.type = "sawtooth";
			osc.frequency.value = noteToHz(midi);
			osc.detune.value = detune;
			osc.connect(filter);
			osc.start(start);
			osc.stop(end + 0.05);
		}
	}
}

/** Filtered noise sweep, used for whooshes and paper crumples. */
function noiseSweep(start, { length = 0.25, from = 600, to = 3000, volume = 0.12, q = 1.2, wet = 0.2, grainy = false } = {}) {
	const rate = ctx.sampleRate;
	const buffer = ctx.createBuffer(1, Math.floor(rate * length), rate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) {
		const crackle = grainy ? (Math.random() < 0.08 ? 1 : 0.15) : 1;
		data[i] = (Math.random() * 2 - 1) * crackle;
	}

	const source = ctx.createBufferSource();
	source.buffer = buffer;

	const filter = ctx.createBiquadFilter();
	filter.type = "bandpass";
	filter.Q.value = q;
	filter.frequency.setValueAtTime(from, start);
	filter.frequency.exponentialRampToValueAtTime(to, start + length);

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(volume, start + length * 0.3);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

	source.connect(filter).connect(gain);
	output(gain, wet);
	source.start(start);
}

function play(build) {
	const audio = getContext();
	if (!audio) return;
	build(audio.currentTime + 0.02);
}

/* ─────────────────────────── Public sounds ─────────────────────────── */

/** Startup: a pad swells under a rising bell figure, then settles on a bright chord. */
export function playStartup() {
	play((t) => {
		pad([56, 63, 67, 72], t, { volume: 0.06, attack: 0.9, hold: 1.6, release: 2.2, cutoff: 2200 }); // Ab maj add9
		pad([44], t, { volume: 0.05, attack: 1.2, hold: 1.4, release: 2.2, cutoff: 600 });
		const figure = [
			[75, 0.15],
			[80, 0.45],
			[84, 0.75],
			[82, 1.15],
			[87, 1.55],
		];
		for (const [midi, offset] of figure) bell(midi, t + offset, { volume: 0.12, length: 2.2 });
		bell(68, t + 1.55, { volume: 0.1, length: 3, brightness: 0.5 });
	});
}

/** Shutdown: a short descending bell line over a fading pad. */
export function playShutdown() {
	play((t) => {
		pad([60, 63, 67], t, { volume: 0.05, attack: 0.3, hold: 0.6, release: 1.6, cutoff: 1500 });
		const figure = [
			[84, 0],
			[79, 0.28],
			[75, 0.56],
			[72, 0.9],
		];
		for (const [midi, offset] of figure) bell(midi, t + offset, { volume: 0.12, length: 1.8 });
	});
}

/** Log on: two quick rising chimes. */
export function playLogon() {
	play((t) => {
		bell(76, t, { volume: 0.12 });
		bell(83, t + 0.14, { volume: 0.12, length: 1.8 });
		pad([64, 71], t, { volume: 0.035, attack: 0.15, hold: 0.3, release: 1, cutoff: 1800 });
	});
}

/** Log off: the same chimes falling. */
export function playLogoff() {
	play((t) => {
		bell(83, t, { volume: 0.12 });
		bell(76, t + 0.16, { volume: 0.12, length: 1.8 });
	});
}

/** Error / default beep: a single round "ding". */
export function playError() {
	play((t) => {
		bell(81, t, { volume: 0.2, length: 0.9, wet: 0.4, brightness: 0.6 });
		bell(69, t, { volume: 0.08, length: 0.7, wet: 0.3, brightness: 0.3 });
	});
}

/** Critical stop: a lower, firmer two-tone. */
export function playCriticalStop() {
	play((t) => {
		bell(64, t, { volume: 0.18, length: 0.6, wet: 0.3, brightness: 0.8 });
		bell(57, t + 0.11, { volume: 0.18, length: 0.9, wet: 0.3, brightness: 0.8 });
	});
}

/** Notification balloon: a soft bubbly pop. */
export function playNotify() {
	play((t) => {
		bell(84, t, { volume: 0.09, length: 0.6, wet: 0.5, brightness: 0.4 });
		bell(91, t + 0.07, { volume: 0.07, length: 0.8, wet: 0.5, brightness: 0.4 });
	});
}

/** Minimize: a short downward whoosh. */
export function playMinimize() {
	play((t) => noiseSweep(t, { length: 0.2, from: 2800, to: 500, volume: 0.07 }));
}

/** Restore / maximize: a short upward whoosh. */
export function playRestore() {
	play((t) => noiseSweep(t, { length: 0.2, from: 500, to: 2800, volume: 0.07 }));
}

/** Navigation click when an app or link is opened. */
export function playClick() {
	play((t) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(1900, t);
		osc.frequency.exponentialRampToValueAtTime(900, t + 0.03);
		gain.gain.setValueAtTime(0.0001, t);
		gain.gain.exponentialRampToValueAtTime(0.12, t + 0.002);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
		osc.connect(gain);
		output(gain, 0);
		osc.start(t);
		osc.stop(t + 0.06);
	});
}

/** Emptying the bin: a papery crumple. */
export function playRecycle() {
	play((t) => {
		noiseSweep(t, { length: 0.35, from: 1200, to: 4000, volume: 0.16, q: 0.8, grainy: true });
		noiseSweep(t + 0.25, { length: 0.3, from: 3000, to: 900, volume: 0.12, q: 0.8, grainy: true });
	});
}
