// Window dimensions
const wnx = window.innerWidth,
	  wny = window.innerHeight;


// Simulation Settings
let mutationRate = 1.5; // Rare mutation rate % (0 to 100)
let distance = 1000; // Starting passing distance
let passTime = 2500; // Timer duration


// Generation populations
let firstGenPop = 1024;
let genPop = 512;

// Simulation speed
let cycles = 1;

// Graph
let graph; // Graph instance
let baseStats; // Object with integer values with last names for the graph

// Matter.js Instances
let world;
let engine;

// Camera offset
let offset = 0;

// Round timer
let _timer = 0;

// Matter.js Bodies
let ground;
let obstacles = [];

// Current Generation's creature configs
let creatureConfigs = [];

function setup() {
	createCanvas(wnx, wny);
		
	engine = Matter.Engine.create();
	engine.timing.timeScale = 1.2;
	world = engine.world;
	world.gravity.y = 8;

	let generation = makeRandomGeneration(firstGenPop);
	
	creatureConfigs = generation.creatureConfigs;
	baseStats = generation.defaultStats;

	currentCreature = new Creature(
		world,
		260+offset,
		wny-360,
		random(3, 6),
		creatureConfigs[0],
		creatureConfigs
	);

	ground = makeGround(world);
	obstacles = makeObstacles(world);

	graph = new Graph({
		x: wnx-500,
		y: 20,
		w: 350,
		h: 350,
		yBounds: genPop,
		xBounds: 10
	});

	for (let i = 0; i < Object.keys(generation.stats).length; i++) {
		graph.addType(creatureConfigs[i].lastname);
	}
	
	graph.update(generation.stats);
}

function draw() {
	background(51);
	translate(offset, 0);

	for (let i = 0; i < cycles; i++) {

		Matter.Engine.update(engine);
		currentCreature.update();

		if (
			currentCreature.getPos() < offset ||
			currentCreature.getPos() > distance * 1.1
		) {
			nextCreature()
			_timer = 0;
		}

		if (_timer > passTime) {
			_timer = 0;	
			nextCreature() 
		} else {
			_timer++; 
		};
		
	};

	ground.draw();
	obstacles.forEach(o => o.draw());
	currentCreature.draw();

	stroke(255, 0, 0, 80);
	strokeWeight(2);
	
	line(distance, 0, distance, wny);

	noStroke();
	fill(255);
	textSize(28)
	text(`Current Gen: ${currentGen}`, 30 - offset, 30)
	text(`Current Creature: ${currentIndex}`, 30 - offset, 60)
	text(`Current Score: ${round(currentCreature.getPos())}`, 30 - offset, 90)	
	text(`timer: ${round(_timer/passTime * 100)}`, 30 - offset, 120);

	graph.draw();

	if (keyIsPressed) {
		if (keyCode === LEFT_ARROW) {
			offset += 20
			graph.pos.x -= 20;
		} else if (keyCode === RIGHT_ARROW) {
			offset -= 20;
			graph.pos.x += 20;
		} else if (keyCode === DOWN_ARROW) {
			offset = 0;
		}
	}

}

function endMessage() {
	textSize(72);
	textAlign(CENTER);
	text("End of simulation", wnx/2, wny/2);
	textSize(48);
	text("No creature qualified", wnx/2, wny/2 + 90);
}
