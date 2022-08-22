
Simulation.prototype.scoreBoard = function() {
	push();

	noStroke();
	fill(255);
	textSize(28);

	text(`Current Gen: ${this.currentGen}`, 30 - this.offset, 30)
	text(`Current Creature: ${this.currentIndex}`, 30 - this.offset, 60)
	text(`Current Score: ${round(this.creature.getPos())}`, 30 - this.offset, 90)	
	text(`timer: ${round(this._timer / this.roundTime * 100)}`, 30 - this.offset, 120);
	
	pop();
}
