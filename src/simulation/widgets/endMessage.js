
Simulation.prototype.endMessage = function() {
	push();
	textSize(72);
	textAlign(CENTER);
	fill(255);
	text("End of simulation", this.window.x / 2, this.window.y / 2);
	textSize(48);
	text("No creature qualified", this.window.x / 2, this.window.y / 2 + 90);
	pop();
}
