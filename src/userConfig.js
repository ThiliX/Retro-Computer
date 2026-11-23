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
	name: "Thilina Wickramanayake",                    // Your display name
	tagline: "Developer ➧ Tech Enthusiast ➧ Gamer",  // Short bio line
	pronouns: "He/Him",                  // Your pronouns
	age: "24",                           // Your age
	location: "Earth",                   // Where you're from
	copyright: "Thilix©",             // Brand mark on the boot screen
	terminalUser: "User",                // Terminal prompt username (C:\Users\____)

	// ─── OPERATING SYSTEM NAME (boot, welcome, System Properties) ─
	osOwner: "ThiliX",                   // small text above the name
	osName: "Portfolio",                 // big name, shown as "<osName> xp"
	osEdition: "Developer Edition",      // line under the name

	// ─── PAGE TITLE & META ────────────────────────────────────
	pageTitle: "ThiliX's Portfolio XP",                // Browser tab title
	pageDescription: "ThiliX's portfolio, running as an early-2000s desktop in the browser.",

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

	// ─── TRAY BALLOON TIPS (shown one after another after logging on) ─
	balloonTips: [
		{ title: "Welcome to Portfolio XP", text: "Double-click the icons on the desktop to open them.", seconds: 6 },
		{ title: "Get to know me", text: "Open 'About Me.txt' or 'My Computer' to learn more about me.", seconds: 6 },
		{ title: "Try the Command Prompt", text: "Type 'help' to see the commands, or 'ask' to ask me something.", seconds: 7 },
	],

	// ─── BROWSER IFRAME URL ───────────────────────────────────
	browserUrl: "https://cat-bounce.com/",

	// ─── BACKGROUND MUSIC (YouTube video ID) ──────────────────
	musicVideoId: "0QKQlf8r7ls",  // lofi hip hop radio

	// ─── WALLPAPER ───────────────────────────────────────────
	// Any image in public/icons/ works (.svg, .png, .jpg, .gif). Examples:
	//   "icons/bliss.jpg"           ← the classic hill photo (default)
	//   "icons/xp/hills.svg"        ← hand-drawn rolling hills
	//   "icons/my-wallpaper.jpg"    ← your own photo
	wallpaper: "icons/bliss.jpg",

	// ─── PROFILE PICTURE ────────────────────────────────────
	// Place your photo in the public/icons/ folder
	// then set the path below. Example:
	//   "icons/selfie.png"  ← your profile picture
	//   "icons/avatar.jpg"  ← any image format works
	profilePicture: "icons/selfie.png",

};

export default userConfig;
