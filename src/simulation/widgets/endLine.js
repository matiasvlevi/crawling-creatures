
Simulation.prototype.endLine = function() {
	push()

	fill(255);
	noStroke();
	textSize(20);
	text(`Distance: ${this.distance}`, this.distance + 32, this.window.y - 20);
	
	stroke(255,0,0);	
	line(this.distance, 0, this.distance, this.window.y);
	
	pop();
}
