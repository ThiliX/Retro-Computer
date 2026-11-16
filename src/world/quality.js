/**
 * Picks a starting render quality for the 3D room.
 *
 * With hardware acceleration turned off, browsers still offer WebGL but draw it
 * on the CPU (SwiftShader, llvmpipe, "Microsoft Basic Render Driver"…), which is
 * far too slow for shadows, bloom and lots of lights. We spot that up front and
 * start in "low"; a frame-rate check inside the scene can still downgrade later.
 */
const SOFTWARE_RENDERERS = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen|microsoft basic/i;

export function detectInitialQuality() {
	// Manual override for testing: ?quality=low or ?quality=high
	const forced = new URLSearchParams(window.location.search).get("quality");
	if (forced === "low" || forced === "high") return forced;

	try {
		const canvas = document.createElement("canvas");

		// Browsers refuse this flag when they would have to fall back to a slow software path.
		const fast = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
		if (!fast) return "low";

		const info = fast.getExtension("WEBGL_debug_renderer_info");
		const renderer = info ? String(fast.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
		fast.getExtension("WEBGL_lose_context")?.loseContext();

		if (SOFTWARE_RENDERERS.test(renderer)) return "low";
		return "high";
	} catch (e) {
		return "low";
	}
}
