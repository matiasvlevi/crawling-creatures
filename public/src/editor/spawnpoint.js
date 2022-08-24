
class Spawnpoint {
	constructor(world, { x, y }) {
		this.world = world;
		this.pos = createVector(x, y);
	}
	static draw(x, y) {
		push();

		stroke(255, 100);
		strokeWeight(3);
		noFill();
		circle(x, y, 260);

		noStroke();
		fill(255, 100);
		circle(x, y, 32);

		pop();
	}

	draw() {
		push();

		stroke(255, 50, 10);
		strokeWeight(3);
		noFill();
		circle(this.pos.x, this.pos.y, 260);

		noStroke();
		fill(255, 50, 10);
		circle(this.pos.x, this.pos.y, 32);

		pop();
	}
}
