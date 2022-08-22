
Simulation.prototype.scoreBoard = function() {
	push();

	noStroke();
	fill(255);
	textSize(28);

	text(`Current Gen:  ${this.currentGen}`, 30 - this.offset, 40)
	text(`Current Creature:  ${this.currentIndex} / ${this.creatureConfigs.length}`, 30 - this.offset, 75)
	text(`Current Score:  ${round(this.creature.getPos())}`, 30 - this.offset, 110)	
	text(`Time:  ${round(this._timer / this.roundTime * 100)} / 100`, 30 - this.offset, 145);
	
	pop();
}
