/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    USER CONFIGURATION                        ║
 * ║                                                              ║
 * ║  Edit this file to customize your retro computer with        ║
 * ║  your own personal details. All fields below are used        ║
 * ║  throughout the app — just change them and you're done!      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const userConfig = {
	// ─── IDENTITY ─────────────────────────────────────────────
	name: "Thilina  Wickramanayake",                    // Your display name
	tagline: "Developer ➧ Tech Enthusiast ➧ Gamer",  // Short bio line
	pronouns: "He/Him",                  // Your pronouns
	age: "24",                           // Your age
	location: "Earth",                   // Where you're from
	copyright: "Thilix©",             // Footer copyright text
	terminalUser: "User",                // Terminal prompt username (C:\Users\____)

	// ─── PAGE TITLE & META ────────────────────────────────────
	pageTitle: "ThiliX's Retro PC",                // Browser tab title
	pageDescription: "ThiliX's retro personal computer on the web.",

	// ─── SOCIAL LINKS (set to "" to hide an icon) ─────────────
	socials: {
		github: "https://github.com/ThiliX",
		twitter: "https://x.com/Thilix4Seven",
		instagram: "",
		spotify: "https://open.spotify.com/user/31xa3bx2mr6szitrkdethfvfdrfq?si=dfbe8170095c404f",
		steam: "https://steamcommunity.com/profiles/76561199050292984/",
		linkedin: "https://www.linkedin.com/in/thilix",
		youtube: "",
	},

	// ─── ABOUT ME (me.txt) ────────────────────────────────────
	aboutMe: {
		intro: "This file is just in case you want to know a little bit more about me.",
		paragraph1:
			"I'm a tech enthusiast who loves building things with code. I enjoy working on web projects, exploring new frameworks, and tinkering with hardware.",
		paragraph2:
			"I have a huge love for retro tech — old computers, CRTs, and classic video games. There's something magical about the aesthetics and simplicity of early computing that keeps pulling me back.",
		paragraph3:
			"In my free time, I enjoy gaming, reading about technology, and working on personal projects. I'm always looking for new challenges and things to learn.",
	},

	// ─── MY PC SPECS (myPc app → config tab) ──────────────────
	pcSpecs: {
		gpu: "NVIDIA GeForce RTX 4070",
		cpu: "AMD Ryzen 5 5600X",
		motherboard: "B550M Motherboard",
		ram: "16 GB DDR4 RAM",
		storage1: "512 GB NVMe SSD",
		storage2: "1TB HDD",
		cooling: "Liquid Cooler",
	},

	// ─── PERIPHERALS (myPc app → setup tab) ───────────────────
	peripherals: {
		mouse: "Logitech G402",
		keyboard: "Mechanical Keyboard",
		headset: "HyperX Cloud II",
		monitor: "24\" 144Hz Monitor",
		mousepad: "Large Desk Mat",
	},

	// ─── SKILLS / STACKS ──────────────────────────────────────
	stacks: "JavaScript, Python, React, Node.js",

	// ─── TERMINAL Q&A (ask command) ───────────────────────────
	terminalQA: [
		{ question: "How old are you?", answer: "I'm 24 years old." },
		{ question: "Where are you from?", answer: "I'm from Earth." },
		{ question: "What are your favorite subjects?", answer: "I love computer science and programming." },
		{ question: "What's your favorite music genre?", answer: "I enjoy retro-wave and electronic music." },
		{ question: "What are your hobbies?", answer: "Gaming, coding, and building things." },
		{ question: "What's your favorite food?", answer: "Sandwich, obviously." },
		{ question: "What's your favorite drink?", answer: "Coffee — fuel for developers." },
		{ question: "What's your favorite book?", answer: "Clean Code by Robert C. Martin." },
		{ question: "What's your favorite TV series?", answer: "Knight Rider." },
		{ question: "What's your biggest dream?", answer: "To build something that changes the world." },
		{ question: "A fun fact about you?", answer: "I’m equally obsessed with coding, Marvel, and Fortnite" },
	],

	// ─── CLIPPY ASSISTANT MESSAGES ────────────────────────────
	clippyMessages: [
		{ text: "Welcome to my retro computer!", delay: 0 },
		{ text: "Feel free to explore the apps on the desktop.", delay: 3 },
		{ text: "Try the terminal — type 'help' to get started.", delay: 6 },
		{ text: "Check out 'me.txt' to learn about me.", delay: 12 },
		{ text: "Enjoy your stay! [SYSTEM IDLE]", delay: 13 },
	],

	// ─── BROWSER IFRAME URL ───────────────────────────────────
	browserUrl: "https://cat-bounce.com/",

	// ─── BACKGROUND MUSIC (YouTube video ID) ──────────────────
	musicVideoId: "0QKQlf8r7ls",  // lofi hip hop radio

	// ─── WALLPAPER ───────────────────────────────────────────
	// Supports .gif (animated) or any image format (.png, .jpg, etc.)
	// Place your wallpaper file in the public/icons/ folder
	// then set the path below. Examples:
	//   "icons/bg1.gif"         ← animated GIF (default)
	//   "icons/my-wallpaper.png" ← static image
	//   "icons/cool-bg.jpg"      ← JPEG photo
	wallpaper: "icons/bg1.gif",

	// ─── PROFILE PICTURE ────────────────────────────────────
	// Place your photo in the public/icons/ folder
	// then set the path below. Example:
	//   "icons/selfie.png"  ← your profile picture
	//   "icons/avatar.jpg"  ← any image format works
	profilePicture: "icons/selfie.png",

	// ─── DESKTOP ICON POSITIONS ──────────────────────────────
	// Each icon has {x, y} position on the desktop grid.
	// x = column (0 = far left, 14.5 = far right)
	// y = row (0 = top, higher = lower)
	// Adjust these to rearrange your desktop layout.
	iconPositions: {
		// internetExplorer: { x: 0, y: 0 },
		netscape: { x: 0, y: 0 },
		terminal: { x: 14.5, y: 0 },
		myPc: { x: 14.5, y: 1 },
		txt: { x: 3, y: 3 },
		synth: { x: 13, y: 1 },
		paint: { x: 13, y: 2 },
		bin: { x: 14.5, y: 6.5 },
		folder: { x: 14.5, y: 2 },
		// Social icons start at this position, stacking vertically
		socialsStartX: 0,
		socialsStartY: 2,
	},
};

export default userConfig;
