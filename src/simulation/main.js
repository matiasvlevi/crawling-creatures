
function setup() {
	simulation = new Simulation({
		distance: 800,
		roundTime: 3000,
		mutationRate: 2.5,
		firstPopulation: 256,
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

