
Simulation.prototype.makeRandomGeneration = function() {
	this.creatureConfigs = [];
	let defaultStats = {};

	for (let i = 0; i < this.firstGenPop; i++) {
		let config = Creature.genConfig(random(3, 6), this.creatureConfigs);
		this.creatureConfigs.push(config);

		if (defaultStats[config.lastname] === undefined)
			defaultStats[config.lastname] = 0;
		else
			defaultStats[config.lastname]++;
	}

    // Graph statistics
	let stats = {...defaultStats};
	for (let i = 0; i < this.firstGenPop; i++) {
		stats[this.creatureConfigs[i].lastname]++;
	}

	return  { stats, defaultStats };
}
