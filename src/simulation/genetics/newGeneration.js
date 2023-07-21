
Simulation.prototype.newGeneration = function() {
	
	let stats = {...this.baseStats};

	let bestConfigs = this.getBestCreatures();
	this.creatureConfigs = [];

    if (bestConfigs.length === 0) return true;

	for (let i = 0; i < this.genPop; i++) {

		let oldConfig = bestConfigs[floor(random(0, bestConfigs.length-0.1))];
		let config = Creature.mutateConfig(this, oldConfig);

		this.creatureConfigs.push(config);

		if (stats[config.lastname] === undefined) 
			stats[config.lastname] = 1;
		else
			stats[config.lastname]++;
	}

    // Align screen
	if (this.distance > this.window.x - 200) {
		this.offset -= 25;
	}
	this.distance += 25;

    this.graph.update(stats);

	return false;
}
