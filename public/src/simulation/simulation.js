
class Simulation {
	constructor({
		mutationRate,
		distance,
		roundTime
	}) {
		this.window = {
			x: window.innerWidth,
			y: window.innerHeight
		};

		this.cycles = 1;

		this.mutationRate = mutationRate || 1.5;
		this.distance = distance || 1000;
		this.roundTime = roundTime || 2500;
		this.firstGenPop = 32;
		this.genPop = 16;

		this._timer = 0;
		this.offset = 0;
		this.running = true;

		this.currentGen = 0;
		this.currentIndex = 0;
		this.bests = [];
		this.bestIndex = 0;
		this.bestScore = 0;

		this.engine = Matter.Engine.create();
		this.engine.timing.timeScale = 1.2;
		this.world = this.engine.world;
		this.world.gravity.y = 8;

		let generation = this.makeRandomGeneration();
		
		this.baseStats = generation.defaultStats;
		this.graph = this.initGraph(generation);	



		this.creature = new Creature(
			this,
			this.offset + 260,
			this.window.y - 360,
			random(3, 6),
			this.creatureConfigs[0], // CLEAN THIS CONSTRUCTOR
			this.creatureConfigs
		);
		this.ground = makeGround(this);
		this.obstacles = makeObstacles(this);
	}

	initGraph(generation) {
		let graph = new Graph({
			x: this.window.x - 500,
			y: 20,
			w: 350,
			h: 350,
			yBounds: this.genPop,
			xBounds: 10
		});

		for (let i = 0; i < Object.keys(generation.stats).length; i++) {
			graph.addType(this.creatureConfigs[i].lastname);
		}
	
		graph.update(generation.stats);

		return graph;
	}

	update() {
		if (!this.running) return;

		for (let i = 0; i < this.cycles; i++) {
	
			Matter.Engine.update(this.engine);
			this.creature.update();

			if (
				this.creature.getPos() < this.offset ||
				this.creature.getPos() > this.distance * 1.1
			) {
				this.nextCreature();
				this._timer = 0;
			}

			if (this._timer > this.roundTime) {
				this._timer = 0;	
				this.nextCreature();
			} else {
				this._timer++; 
			};	
	
		}
	}

	draw() {
		push();
		translate(this.offset, 0);

		this.ground.draw();
		this.obstacles.forEach(o => o.draw());

		stroke(255, 0, 0, 80);
		strokeWeight(2);

		this.endLine();
		this.scoreBoard();

		if (this.running) this.creature.draw();
		else this.endMessage();



		pop();

		this.graph.draw();

	}

	events() {
		if (keyIsPressed) {
			if (keyCode === LEFT_ARROW) {
				this.offset += 20
			} else if (keyCode === RIGHT_ARROW) {
				this.offset -= 20;
			} else if (keyCode === DOWN_ARROW) {
				this.offset = 0;
			}
		}
	}
}

let simulation;
