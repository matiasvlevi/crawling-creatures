
function setup() {
	simulation = new Simulation({
		distance: 1000,
		roundTime: 2200,
		mutationRate: 1.5,
		firstPopulation: 512,
		population: 128
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

