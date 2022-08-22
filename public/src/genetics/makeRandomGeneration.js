function makeRandomGeneration(n) {
	let creatureConfigs = [];
	let defaultStats = {};
	for (let i = 0; i < n; i++) {
		let config = Creature.genConfig(random(3, 6), creatureConfigs);
		creatureConfigs.push(config);

		if (defaultStats[config.lastname] === undefined)
			defaultStats[config.lastname] = 0;
		else
			defaultStats[config.lastname]++;
	}

    // Graph statistics
	let stats = {...defaultStats};
	for (let i = 0; i < n; i++) {
		stats[creatureConfigs[i].lastname]++;
	}

	return {creatureConfigs, stats, defaultStats};
}