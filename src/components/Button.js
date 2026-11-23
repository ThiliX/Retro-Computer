function Button({ text, width, height, onClick }) {
	return (
		<button className="xp-button" style={{ width, height }} onClick={onClick}>
			{text}
		</button>
	);
}

export default Button;
