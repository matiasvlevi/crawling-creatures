let currentGen = 0;
let currentCreature = 0;
let currentIndex = 0;

Simulation.prototype.nextCreature = function() {
    // is creature passing?
	if (this.distance < this.creature.getPos()) {
		this.bests.push(this.currentIndex);

        // Creature Qualified message
        console.log(`${this.creature.config.lastname} Qualified !!!`);
		console.log(this.creature);
	}
	this.currentIndex++;

    // is new generation?
	if (this.currentIndex >= this.creatureConfigs.length) {
        
		if (this.newGeneration()) {
			this.running = false;
			return;
		}

        // Increment generation
        this.currentGen++;
        this.currentIndex = 0;

        this.bests = [];

        console.log(`Generation ${this.currentGen}`);
	}

    // Remove Creature's matter.js bodies
	this.creature.destructor();

	// Initialize new Creature
    this.creature = new Creature(
        this,
        this.offset + 260,
        this.window.y - 260,
        5,
        this.creatureConfigs[this.currentIndex], // CLEAN THIS CONSTRUCTOR
        this.creatureConfigs
    );

    return true;
}
