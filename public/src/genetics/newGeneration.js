function uploadGraph() {
	fetch('http://127.0.0.1:3000/upload', {
		method: 'post',
		body: JSON.stringify({
			graph:graph.toData(),
			meta: {
				currentGen,
				currentIndex
			}
		}),
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}) 
}

function newGeneration(n, bestConfigs) {
	
	let stats = {...baseStats};
    let creatureConfigs = [];

    console.log(bestConfigs)
    if (bestConfigs[0] === undefined) {
        console.log('No creatures survived in the simulation');
        endMessage();
        noLoop();
    }

	for (let i = 0; i < n; i++) {
		let oldConfig = bestConfigs[floor(random(0, bestConfigs.length))];
		let config = Creature.mutateConfig(oldConfig);
		creatureConfigs.push(config);


		if (stats[config.lastname] === undefined) 
			stats[config.lastname] = 1;
		else
			stats[config.lastname]++;
	}

    // Align screen
    offset -= 75;
    distance += 75;
    graph.pos.x += 75;

    graph.update(stats);

    uploadGraph();

	return {creatureConfigs, stats};
}
