Simulation.prototype.clearMatterBodies = function(bodies) {
	bodies.forEach(body => {
		console.log(body)
		Matter.World.remove(this.world, body.body);
	})
}

Simulation.prototype.makeObstaclesFrom = function(bodies) {
	let obstacles = [];
	bodies.forEach(body => {

		let Component;
		switch(body.type) {
			case 'Rectangle':
				Component = Block;
				break;
			case 'Circle':
				Component = Ball;
				break;
			case 'Spawnpoint':
				this.spawn.x = body.x;
				this.spawn.y = body.y;
				return;
			default:
				break;
		}

		delete body.type;
		body.color = '#222';
		obstacles.push(new Component(
			this.world, 
			body,
			{ isStatic: true }
		));
	});
	return obstacles;
}

Simulation.prototype.reloadSimulation = function(config) {
	this.cycles = 1;
	
	this.mutationRate = config.metrics.mutationRate || 1.5;
	this.distance = config.metrics.distance || 1000;
	this.roundTime = config.metrics.roundTime || 2500;
	this.firstGenPop = config.metrics.firstPopulation || 128;
	this.genPop = config.metrics.population || 48;

	this._timer = 0;
	this.offset = 0;
	this.running = true;

	this.currentGen = 0;
	this.currentIndex = 0;
	this.bests = [];
	this.bestIndex = 0;
	this.bestScore = 0;

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

	this.clearMatterBodies(this.obstacles);
	this.obstacles = this.makeObstaclesFrom(config.bodies);
}

Simulation.prototype.loadSimulation = async function (name) {
	const data = await Server.http({
		ip: '127.0.0.1',
		port: '3000',
		path: `getSimulation?id=${name}`,
		method: 'get'
	});

	this.reloadSimulation(data);
}
