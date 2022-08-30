
class Simulation {
	constructor({
		mutationRate,
		distance,
		roundTime,
		firstPopulation,
		population
	}) {
		this.window = {
			x: window.innerWidth,
			y: window.innerHeight
		};

		this.spawn = {
			x: 260,
			y: this.window.y - 360
		}

		this.cycles = 1;

		this.mutationRate = mutationRate || 1.5;
		this.distance = distance || 1000;
		this.roundTime = roundTime || 2500;
		this.firstGenPop = firstPopulation || 128;
		this.genPop = population || 48;

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
		this.world.gravity.y = 5;

		let generation = this.makeRandomGeneration();
		
		this.baseStats = generation.defaultStats;
		this.graph = this.initGraph(generation);	

		this.creature = new Creature(
			this,
			this.spawn.x,
			this.spawn.y,
			random(3, 6),
			this.creatureConfigs[0], // CLEAN THIS CONSTRUCTOR
			this.creatureConfigs
		);

		this.obstacles = makeObstacles(this);
		this.obstacles.push(makeGround(this));

		this.btnIncrementCycle = new Button({
			x: 110,
			y: 215,
			w: 50,
			h: 50,
			text: '>',
			event: () => {
				if (this.cycles < 99)
					this.cycles += 1;
				else
					this.cycles = 100;
			}
		});

		this.btnDecrementCycle = new Button({
			x: 30,
			y: 215,
			w: 50,
			h: 50,
			text: '<',
			event: () => {
				if (this.cycles > 1)
					this.cycles -= 1;
				else
					this.cycles = 1;
			}
		});
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

		this.obstacles.forEach(o => o.draw());

		stroke(255, 0, 0, 80);
		strokeWeight(2);

		this.endLine();
		this.scoreBoard();

		if (this.running) this.creature.draw(); 

		pop();

		if (!this.running) this.endMessage();
		
		this.btnIncrementCycle.draw();
		this.btnDecrementCycle.draw();

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
