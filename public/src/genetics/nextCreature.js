let currentGen = 0;
let currentCreature = 0;
let currentIndex = 0;

function nextCreature() {
    // is creature passing?
	if (distance < currentCreature.getPos()) {
		bestScore = currentCreature.getPos();
		bestIndex = currentIndex;
		bests.push(bestIndex);

        // Creature Qualified message
        console.log(`No:${bestIndex} Qualified !!!`);
		console.log(currentCreature);
	}
	currentIndex++;

    // is new generation?
    console.log('endGenCond ', currentIndex, creatureConfigs.length)
	if (currentIndex >= creatureConfigs.length) {
        
		let generation = newGeneration(genPop, bestOf(creatureConfigs));
        creatureConfigs = generation.creatureConfigs;


        // Increment generation
        currentGen++;
        currentIndex = 0;

        // reset generation
        //bestIndex = 0;
        //bestScore = 0;
        bests = [];

        console.log(`Generation ${currentGen}`);
	}

    // Remove Creature's matter.js bodies
	currentCreature.destructor();

	// Initialize new Creature
    currentCreature = new Creature(
        world,
        260+offset,
        wny-260,
        5,
        creatureConfigs[currentIndex],
        creatureConfigs
    );

    return true;
}
