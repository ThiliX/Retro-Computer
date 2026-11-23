import { useRef, useState } from "react";

import "./BrowserRenderer.css";
import userConfig from "../../userConfig";

/** An early-2000s style web browser around an iframe. */
function BrowserRenderer() {
	const [url, setUrl] = useState(userConfig.browserUrl);
	const [address, setAddress] = useState(userConfig.browserUrl);
	const [status, setStatus] = useState("Opening page...");
	const frameRef = useRef(null);

	function go(target = address) {
		let next = target.trim();
		if (!next) return;
		if (!/^https?:\/\//i.test(next)) next = `https://${next}`;
		setAddress(next);
		setStatus("Opening page...");
		if (next === url && frameRef.current) frameRef.current.src = next;
		setUrl(next);
	}

	return (
		<div className="ie">
			<div className="xp-menubar">
				<span>File</span>
				<span>Edit</span>
				<span>View</span>
				<span>Favorites</span>
				<span>Tools</span>
				<span>Help</span>
			</div>

			<div className="ie-toolbar">
				<button className="ie-tool" onClick={() => frameRef.current?.contentWindow?.history.back()} title="Back">
					<span className="ie-round green">◀</span>
					<span>Back</span>
				</button>
				<button className="ie-tool" onClick={() => frameRef.current?.contentWindow?.history.forward()} title="Forward">
					<span className="ie-round green">▶</span>
				</button>
				<span className="ie-divider" />
				<button className="ie-tool" onClick={() => go(url)} title="Refresh">
					<span className="ie-glyph">⟳</span>
				</button>
				<button className="ie-tool" onClick={() => go(userConfig.browserUrl)} title="Home">
					<span className="ie-glyph">⌂</span>
				</button>
				<span className="ie-divider" />
				<button className="ie-tool" onClick={() => go(userConfig.socials.github)} title="Favorites">
					<span className="ie-glyph star">★</span>
					<span>Favorites</span>
				</button>
			</div>

			<form
				className="ie-address"
				onSubmit={(event) => {
					event.preventDefault();
					go();
				}}
			>
				<span className="ie-address-label">Address</span>
				<div className="ie-address-field">
					<img src="icons/xp/Network.ico" alt="" />
					<input value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => event.stopPropagation()} spellCheck={false} />
				</div>
				<button type="submit" className="ie-go">
					<span className="ie-go-arrow">➜</span> Go
				</button>
			</form>

			<div className="ie-content">
				<iframe ref={frameRef} src={url} title="browser" onLoad={() => setStatus("Done")} />
			</div>

			<div className="ie-status">
				<span className="ie-status-text">{status}</span>
				<span className="ie-status-zone">
					<img src="icons/xp/Network.ico" alt="" /> Internet
				</span>
			</div>
		</div>
	);
}

export default BrowserRenderer;
