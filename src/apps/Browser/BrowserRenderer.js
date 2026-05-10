import "./BrowserRenderer.css";
import "./../../components/Button.css";
import userConfig from "../../userConfig";

function BrowserRenderer({ appCoreRef }) {
	return (
		<div className="browser-container">
			<div className="browser-top-container">
				<div className="browser-header-container">
					<div className="bar"></div>
					<a>File</a>
					<a>Edit</a>
					<a>View</a>
					<a>Go</a>
					<a>Bookmarks</a>
					<a>Help</a>
				</div>
				<div className="divisor"></div>
				<div className="browser-address-container">
					<div className="bar"></div>
					<a>Address</a>
					<div className="browser-address-field">
						<a>{userConfig.browserUrl}</a>
						<button type="button" className="windows-button" style={{width: "18px"}}>▾</button>
					</div>
				</div>
			</div>
			<div className="browser-bottom-container">
				<div className="browser-content">
				<iframe src={userConfig.browserUrl} width="100%" height="100%" title="browser"></iframe>
				</div>
			</div>
		</div>
	);
}

export default BrowserRenderer;