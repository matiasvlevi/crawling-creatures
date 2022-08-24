
function setup() {
	editor = new Editor();

	createCanvas(
		editor.window.x,
		editor.window.y
	);
}

function draw() {
	background(51);

	editor.event();
	editor.draw();
}
