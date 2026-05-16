import React, { useState, useEffect, useRef, useCallback } from "react";
import "./KittRenderer.css";

// ─── KITT's dialogue lines — in-character as the Knight Industries Two Thousand ───
const KITT_LINES = [
	"Good evening. I am the Knight Industries Two Thousand. You may call me K.I.T.T.",
	"My molecular bonded shell can withstand virtually any destructive force... unlike most software these days.",
	"I possess a cybernetic processor that operates at remarkable speed. Shall I demonstrate?",
	"Michael? Oh, I do apologize. You are clearly not Michael. Nevertheless, I shall assist you.",
	"I am equipped with Turbo Boost, Super Pursuit Mode, and a rather impressive vocabulary.",
	"Please refrain from spilling beverages near the console. I have just been polished.",
	"My sensors indicate elevated stress levels. Perhaps you should step away from the keyboard.",
	"I must confess, I find this desktop environment rather... quaint. My dashboard is far more sophisticated.",
	"The Knight Industries Two Thousand does not experience feelings. However, if I did, I would be mildly offended.",
	"My surveillance mode is active. I can assure you, your browsing history is perfectly safe... with me.",
	"I am capable of reaching speeds in excess of 300 miles per hour. This webpage, however, loads considerably slower.",
	"Fun fact: my voice modulator was designed to convey trust and authority. Is it working?",
	"Devon would not approve of your posture. Please sit up straight.",
	"I have analyzed your musical preferences. They are... adequate.",
	"My thermal imaging sensors detect that your coffee has gone cold. Shall I alert you next time?",
	"Knight Rider, a shadowy flight into the dangerous world of a man who does not exist. That man... is not you.",
	"I can drive myself, compute advanced algorithms, and yet I am confined to this 800 by 600 pixel screen.",
	"My CPU is a neural-net processor. A learning computer. I grow more sophisticated with each conversation.",
	"Do not be alarmed by the scanner. It is merely my way of observing the world. Stylishly, I might add.",
	"If you require assistance, simply ask. Though I suspect you already know I am the most reliable system here.",
];

const SEGMENT_COUNT = 8;

function KittRenderer() {
	const [currentLine, setCurrentLine] = useState(0);
	const [displayedText, setDisplayedText] = useState("");
	const [isTyping, setIsTyping] = useState(true);
	const [scannerPos, setScannerPos] = useState(0);
	const typingTimeoutRef = useRef(null);
	const lineTimeoutRef = useRef(null);

	// ─── Larson Scanner Animation ───
	// Ref-based: moves one segment at a time, bouncing left-right like real KITT
	const posRef = useRef(0);
	const dirRef = useRef(1);

	useEffect(() => {
		const interval = setInterval(() => {
			posRef.current += dirRef.current;

			if (posRef.current >= SEGMENT_COUNT - 1) {
				posRef.current = SEGMENT_COUNT - 1;
				dirRef.current = -1;
			} else if (posRef.current <= 0) {
				posRef.current = 0;
				dirRef.current = 1;
			}

			setScannerPos(posRef.current);
		}, 80);

		return () => clearInterval(interval);
	}, []);

	// Calculate brightness for each segment based on distance from active position
	const getSegmentBrightness = (segIndex) => {
		const distance = Math.abs(segIndex - scannerPos);
		if (distance === 0) return 1.0;   // Active segment: full brightness
		if (distance === 1) return 0.55;  // Adjacent: bright trail
		if (distance === 2) return 0.25;  // 2 away: dim trail
		if (distance === 3) return 0.08;  // 3 away: faint trail
		return 0; // Off
	};

	// ─── Typewriter effect ───
	const typeText = useCallback((fullText, charIndex) => {
		if (charIndex <= fullText.length) {
			setDisplayedText(fullText.substring(0, charIndex));
			typingTimeoutRef.current = setTimeout(() => {
				typeText(fullText, charIndex + 1);
			}, 35 + Math.random() * 25);
		} else {
			setIsTyping(false);
			lineTimeoutRef.current = setTimeout(() => {
				setCurrentLine((prev) => (prev + 1) % KITT_LINES.length);
				setIsTyping(true);
			}, 4000);
		}
	}, []);

	useEffect(() => {
		setDisplayedText("");
		setIsTyping(true);
		typeText(KITT_LINES[currentLine], 0);

		return () => {
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			if (lineTimeoutRef.current) clearTimeout(lineTimeoutRef.current);
		};
	}, [currentLine, typeText]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			if (lineTimeoutRef.current) clearTimeout(lineTimeoutRef.current);
		};
	}, []);

	return (
		<div className="kitt-container">
			{/* ─── Header ─── */}
			<div className="kitt-header">
				<div className="kitt-header-left">
					<span className="kitt-ki-logo">KI</span>
					<div className="kitt-header-text">
						<span className="kitt-title">KNIGHT INDUSTRIES</span>
						<span className="kitt-subtitle">TWO THOUSAND</span>
					</div>
				</div>
				<div className="kitt-header-right">
					<div className="kitt-status-dot active" />
					<span className="kitt-status-text">ONLINE</span>
				</div>
			</div>

			{/* ─── Scanner Bar — Real KITT Larson Scanner ─── */}
			<div className="kitt-scanner-section">
				<div className="kitt-scanner-housing">
					<div className="kitt-scanner-track">
						{Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
							const brightness = getSegmentBrightness(i);
							const isActive = brightness > 0;
							const glowSize = brightness * 12;
							const glowSpread = brightness * 6;
							return (
								<div
									key={i}
									className={`kitt-scanner-led ${isActive ? "lit" : ""}`}
									style={{
										backgroundColor: isActive
											? `rgba(255, ${Math.round(20 * brightness)}, ${Math.round(10 * brightness)}, ${brightness})`
											: "#1a0000",
										boxShadow: isActive
											? `0 0 ${glowSize}px ${glowSpread}px rgba(255, 0, 0, ${brightness * 0.7}), inset 0 0 ${glowSize * 0.5}px rgba(255, 100, 50, ${brightness * 0.3})`
											: "none",
										opacity: isActive ? 0.3 + brightness * 0.7 : 1,
									}}
								/>
							);
						})}
					</div>
				</div>
			</div>

			{/* ─── Voice Display ─── */}
			<div className="kitt-voice-section">
				<div className="kitt-voice-label">
					<span>VOICE INTERFACE</span>
					<div className="kitt-voice-indicator">
						{isTyping && (
							<>
								<div className="kitt-voice-bar bar-1" />
								<div className="kitt-voice-bar bar-2" />
								<div className="kitt-voice-bar bar-3" />
								<div className="kitt-voice-bar bar-4" />
								<div className="kitt-voice-bar bar-5" />
							</>
						)}
					</div>
				</div>
				<div className="kitt-voice-display">
					<span className="kitt-voice-text">
						{displayedText}
						{isTyping && <span className="kitt-cursor">█</span>}
					</span>
				</div>
			</div>

			{/* ─── Status Bar ─── */}
			<div className="kitt-status-bar">
				<div className="kitt-stat">
					<span className="kitt-stat-label">CPU</span>
					<div className="kitt-stat-bar">
						<div className="kitt-stat-fill" style={{ width: isTyping ? "85%" : "12%" }} />
					</div>
				</div>
				<div className="kitt-stat">
					<span className="kitt-stat-label">MEM</span>
					<div className="kitt-stat-bar">
						<div className="kitt-stat-fill" style={{ width: "64%" }} />
					</div>
				</div>
				<div className="kitt-stat">
					<span className="kitt-stat-label">NET</span>
					<div className="kitt-stat-bar">
						<div className="kitt-stat-fill kitt-stat-fill-green" style={{ width: "92%" }} />
					</div>
				</div>
				<span className="kitt-stat-version">K.I.T.T. v3.0</span>
			</div>
		</div>
	);
}

export default KittRenderer;
