
Simulation.prototype.getBestCreatures = function() {
	let configs = [];
	for (let i = 0; i < this.bests.length; i++) {
		configs.push(this.creatureConfigs[this.bests.pop()])
	}
	return configs;
}
