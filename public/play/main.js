
function setup() {
	simulation = new Simulation({
		distance: 1000,
		roundTime: 2500,
		mutationRate: 1.5
	});	

	createCanvas(
		simulation.window.x,
		simulation.window.y
	);	
}

function draw() {
	background(51);	
	simulation.events();
	simulation.update();

	simulation.draw();
}

