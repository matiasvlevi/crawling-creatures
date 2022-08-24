class Button {
	constructor({ x, y, w, h, event, text }) {
		this.pos = createVector(x || 0, y || 0);
		this.size = createVector(w || 50, h || 50);
		this.color = color('#222');
		this.text = text || '';
		this.event = event || (() => console.log(`Button Clicked!`));
	}

	update() {
		if (
			mouseX > this.pos.x &&
			mouseX < this.pos.x + this.size.x &&
			mouseY > this.pos.y &&
			mouseY < this.pos.y + this.size.y 
		) {
			this.color = color('#444');
			
			if (mouseIsPressed) { 
				this.color = color('#555');
				this.event();
			}

		} else {
			this.color = color('#222');
		}
	}

	draw() {
		push();

		fill(this.color);
		rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

		fill(255);
		textAlign(CENTER);
		textSize(this.size.x / 2);
		text(this.text, this.pos.x + this.size.x/2, this.pos.y + this.size.y/1.5);

		pop();
	}
}


Simulation.prototype.scoreBoard = function() {
	push();

	noStroke();
	fill(255);
	textSize(28);

	text(`Current Gen:  ${this.currentGen}`, 30 - this.offset, 40)
	text(`Current Creature:  ${this.currentIndex} / ${this.creatureConfigs.length}`, 30 - this.offset, 75)
	text(`Current Score:  ${round(this.creature.getPos())}`, 30 - this.offset, 110)	
	text(`Time:  ${round(this._timer / this.roundTime * 100)} / 100`, 30 - this.offset, 145);

	text(`Time Scale:  ${this.cycles}x`, 30 - this.offset, 200);
	this.btnIncrementCycle.update();
	this.btnDecrementCycle.update();

	pop();
}
