import "./MyPcSleeperRenderer.css";
import "../MyPcRenderer.css"

function MyPcSleeperRenderer({ appRef }) {
	return (
		<div className="my-pc-renderer-container" style={{ 
			display: "flex", 
			justifyContent: "center", 
			alignItems: "center", 
			color: "#00ff41", 
			fontFamily: "'VT323', monospace",
			textShadow: "0 0 10px rgba(0,255,65,0.5)"
		}}>
			<h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "14px" }}>[ SLEEP MODE ]</h1>
			<p style={{ fontSize: "16px", opacity: 0.7 }}>System is hibernating...</p>
		</div>
	);
}

export default MyPcSleeperRenderer;
