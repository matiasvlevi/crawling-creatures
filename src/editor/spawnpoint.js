
class Spawnpoint {
	constructor(world, { x, y, r }) {
		this.world = world;
		this.pos = createVector(x, y);
		this.radius = r;


		this.attributes = {
			label: 'Spawnpoint'
		};
	}
	static draw(x, y) {
		push();

		stroke(255, 100);
		strokeWeight(3);
		noFill();
		circle(x, y, 260/1.2);

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
		circle(this.pos.x, this.pos.y, this.radius);

		noStroke();
		fill(255, 50, 10);
		circle(this.pos.x, this.pos.y, 32);

		pop();
	}
}
