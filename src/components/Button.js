import "./Button.css";

function Button({ text, width, height, onClick }) {
	return (
		<div className="windows-button-container">
			<button className="windows-button" style={{ width: width, height: height }} onClick={onClick}>
				{text}
			</button>
		</div>
	);
}

export default Button;
