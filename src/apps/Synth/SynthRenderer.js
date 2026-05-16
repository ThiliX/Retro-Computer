import React, { useRef, useEffect, useCallback } from "react";
import "./SynthRenderer.css";

// ─── Note frequencies (4th octave) ────────────────────────────
const NOTES = [
	{ key: "A", label: "C", freq: 261.63, type: "white" },
	{ key: "W", label: "C#", freq: 277.18, type: "black" },
	{ key: "S", label: "D", freq: 293.66, type: "white" },
	{ key: "E", label: "D#", freq: 311.13, type: "black" },
	{ key: "D", label: "E", freq: 329.63, type: "white" },
	{ key: "F", label: "F", freq: 349.23, type: "white" },
	{ key: "T", label: "F#", freq: 369.99, type: "black" },
	{ key: "G", label: "G", freq: 392.0, type: "white" },
	{ key: "Y", label: "G#", freq: 415.3, type: "black" },
	{ key: "H", label: "A", freq: 440.0, type: "white" },
	{ key: "U", label: "A#", freq: 466.16, type: "black" },
	{ key: "J", label: "B", freq: 493.88, type: "white" },
	{ key: "K", label: "C5", freq: 523.25, type: "white" },
	{ key: "O", label: "C#5", freq: 554.37, type: "black" },
	{ key: "L", label: "D5", freq: 587.33, type: "white" },
];

const WAVE_TYPES = ["sawtooth", "square", "triangle", "sine"];
const WAVE_LABELS = ["SAW", "SQR", "TRI", "SIN"];

function SynthRenderer() {
	const audioCtxRef = useRef(null);
	const activeNotesRef = useRef({});
	const [waveType, setWaveType] = React.useState(0);
	const [reverbOn, setReverbOn] = React.useState(false);
	const [octaveShift, setOctaveShift] = React.useState(0);
	const [activeKeys, setActiveKeys] = React.useState(new Set());
	const convolverRef = useRef(null);
	const dryGainRef = useRef(null);
	const wetGainRef = useRef(null);

	// Initialize audio context
	const getAudioCtx = useCallback(() => {
		if (!audioCtxRef.current) {
			const ctx = new (window.AudioContext || window.webkitAudioContext)();

			// Create reverb convolver
			const convolver = ctx.createConvolver();
			const sampleRate = ctx.sampleRate;
			const length = sampleRate * 2;
			const impulse = ctx.createBuffer(2, length, sampleRate);
			for (let channel = 0; channel < 2; channel++) {
				const data = impulse.getChannelData(channel);
				for (let i = 0; i < length; i++) {
					data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
				}
			}
			convolver.buffer = impulse;
			convolverRef.current = convolver;

			// Dry/wet routing
			const dryGain = ctx.createGain();
			const wetGain = ctx.createGain();
			dryGain.gain.value = 1;
			wetGain.gain.value = 0;
			dryGain.connect(ctx.destination);
			convolver.connect(wetGain);
			wetGain.connect(ctx.destination);
			dryGainRef.current = dryGain;
			wetGainRef.current = wetGain;

			audioCtxRef.current = ctx;
		}
		if (audioCtxRef.current.state === "suspended") {
			audioCtxRef.current.resume();
		}
		return audioCtxRef.current;
	}, []);

	// Update reverb mix
	useEffect(() => {
		if (dryGainRef.current && wetGainRef.current) {
			dryGainRef.current.gain.value = reverbOn ? 0.6 : 1;
			wetGainRef.current.gain.value = reverbOn ? 0.8 : 0;
		}
	}, [reverbOn]);

	// Play a note
	const playNote = useCallback(
		(noteKey) => {
			if (activeNotesRef.current[noteKey]) return;

			const note = NOTES.find((n) => n.key === noteKey);
			if (!note) return;

			const ctx = getAudioCtx();
			const freq = note.freq * Math.pow(2, octaveShift);

			// Oscillator
			const osc = ctx.createOscillator();
			osc.type = WAVE_TYPES[waveType];
			osc.frequency.setValueAtTime(freq, ctx.currentTime);

			// Gain envelope
			const gainNode = ctx.createGain();
			gainNode.gain.setValueAtTime(0, ctx.currentTime);
			gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);

			// Connect to dry + convolver
			osc.connect(gainNode);
			gainNode.connect(dryGainRef.current || ctx.destination);
			if (convolverRef.current) {
				gainNode.connect(convolverRef.current);
			}

			osc.start(ctx.currentTime);

			activeNotesRef.current[noteKey] = { osc, gainNode };
			setActiveKeys((prev) => new Set([...prev, noteKey]));
		},
		[getAudioCtx, waveType, octaveShift]
	);

	// Stop a note
	const stopNote = useCallback((noteKey) => {
		const noteData = activeNotesRef.current[noteKey];
		if (!noteData) return;

		const { osc, gainNode } = noteData;
		const ctx = audioCtxRef.current;
		if (ctx) {
			gainNode.gain.cancelScheduledValues(ctx.currentTime);
			gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
			osc.stop(ctx.currentTime + 0.15);
		}

		delete activeNotesRef.current[noteKey];
		setActiveKeys((prev) => {
			const next = new Set(prev);
			next.delete(noteKey);
			return next;
		});
	}, []);

	// Keyboard events
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.repeat) return;
			const key = e.key.toUpperCase();
			playNote(key);
		};

		const handleKeyUp = (e) => {
			const key = e.key.toUpperCase();
			stopNote(key);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [playNote, stopNote]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			Object.values(activeNotesRef.current).forEach(({ osc }) => {
				try { osc.stop(); } catch (e) { /* ignore */ }
			});
			if (audioCtxRef.current) {
				audioCtxRef.current.close();
				audioCtxRef.current = null;
			}
		};
	}, []);

	const whiteKeys = NOTES.filter((n) => n.type === "white");
	const blackKeys = NOTES.filter((n) => n.type === "black");

	// Map black keys to their position relative to white keys
	const getBlackKeyPosition = (blackNote) => {
		const whiteIndex = whiteKeys.findIndex((w) => w.freq > blackNote.freq) - 1;
		// Offset: position after the white key it's sharping
		return whiteIndex >= 0 ? whiteIndex : 0;
	};

	return (
		<div className="synth-container">
			{/* ─── Header Panel ─── */}
			<div className="synth-header">
				<div className="synth-brand">
					<span className="synth-brand-name">SYNTH-80</span>
					<span className="synth-brand-sub">POLYPHONIC SYNTHESIZER</span>
				</div>
				<div className="synth-leds">
					<div className={`synth-led ${activeKeys.size > 0 ? "active" : ""}`} />
					<div className={`synth-led synth-led-power active`} />
				</div>
			</div>

			{/* ─── Controls ─── */}
			<div className="synth-controls">
				<div className="synth-control-group">
					<span className="synth-control-label">WAVEFORM</span>
					<div className="synth-wave-buttons">
						{WAVE_LABELS.map((label, i) => (
							<button
								key={label}
								className={`synth-wave-btn ${waveType === i ? "active" : ""}`}
								onClick={() => setWaveType(i)}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				<div className="synth-control-group">
					<span className="synth-control-label">OCTAVE</span>
					<div className="synth-octave-controls">
						<button
							className="synth-oct-btn"
							onClick={() => setOctaveShift((p) => Math.max(p - 1, -2))}
						>
							−
						</button>
						<span className="synth-oct-display">{octaveShift >= 0 ? `+${octaveShift}` : octaveShift}</span>
						<button
							className="synth-oct-btn"
							onClick={() => setOctaveShift((p) => Math.min(p + 1, 2))}
						>
							+
						</button>
					</div>
				</div>

				<div className="synth-control-group">
					<span className="synth-control-label">REVERB</span>
					<button
						className={`synth-reverb-btn ${reverbOn ? "active" : ""}`}
						onClick={() => setReverbOn((p) => !p)}
					>
						{reverbOn ? "ON" : "OFF"}
					</button>
				</div>
			</div>

			{/* ─── Keyboard ─── */}
			<div className="synth-keyboard">
				{/* White keys */}
				{whiteKeys.map((note) => (
					<div
						key={note.key}
						className={`synth-key synth-key-white ${activeKeys.has(note.key) ? "pressed" : ""}`}
						onMouseDown={() => playNote(note.key)}
						onMouseUp={() => stopNote(note.key)}
						onMouseLeave={() => stopNote(note.key)}
					>
						<span className="synth-key-label">{note.label}</span>
						<span className="synth-key-bind">{note.key}</span>
					</div>
				))}
				{/* Black keys */}
				{blackKeys.map((note) => {
					const pos = getBlackKeyPosition(note);
					return (
						<div
							key={note.key}
							className={`synth-key synth-key-black ${activeKeys.has(note.key) ? "pressed" : ""}`}
							style={{ left: `${pos * (100 / whiteKeys.length) + (100 / whiteKeys.length) * 0.65}%` }}
							onMouseDown={() => playNote(note.key)}
							onMouseUp={() => stopNote(note.key)}
							onMouseLeave={() => stopNote(note.key)}
						>
							<span className="synth-key-label">{note.label}</span>
							<span className="synth-key-bind">{note.key}</span>
						</div>
					);
				})}
			</div>

			{/* ─── Footer ─── */}
			<div className="synth-footer">
				<span>KEYS: A S D F G H J K L (white) &nbsp;|&nbsp; W E T Y U O (black)</span>
			</div>
		</div>
	);
}

export default SynthRenderer;
