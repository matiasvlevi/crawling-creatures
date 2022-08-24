/*!
 genetic-creatures v1.0.0 by Matias Vazquez-Levi 
 Build date: 2022-08-24
 License: MIT
*/

class Spawnpoint {
	constructor(world, { x, y }) {
		this.world = world;
		this.pos = createVector(x, y);

		this.attributes = {
			label: 'Spawnpoint'
		};
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
;
class Editor {
	constructor() {

		this.window = {
			x: window.innerWidth,
			y: window.innerHeight,
		};

		this.space = {
			x: this.window.x/1.2,
			y: this.window.y/1.2
		};

		this.engine = Matter.Engine.create();
		this.world = this.engine.world;

		this.placement = {
			body: Editor.bodies['Block'],
			size: createVector(32, 32),
			gridSize: 32
		};
		
		this.previous = {
			mouseX: 0,
			mouseY: 0
		};

		this.toggleOptions = {
			grid: true,
			snap: false
		};

		this.bodies = [];

		this.release = true;
		this._timer = 0;
		this._cooldown = 10;
	}

	static bodies = {
		Block: {
			Component: Block,
			shape: (function() {rect(...arguments)}),
			config: (ref, size) => ({
				x: ref.mouse().x,
				y: ref.mouse().y,
				w: size.x,
				h: size.y,
				color: '#222'
			}),
			parse: (component) => ({
				x: component.body.position.x,
				y: component.body.position.y,
				w: component.attributes.w,
				h: component.attrubutes.h
			})
		},
		Ball: {
			Component: Ball,
			shape: (function() {ellipse(...arguments)}),
			config: (ref, size) => ({
				x: ref.mouse().x,
				y: ref.mouse().y,
				r: size.x/2,
				color: '#222'
			}),
			parse: (component) => ({
				x: component.body.position.x,
				y: component.body.position.y,
				r: component.attributes.r,
			})
		},
		Spawnpoint: {
			Component: Spawnpoint,
			shape: (function() {Spawnpoint.draw(...arguments)}),
			config: (ref) => ({
				x: ref.mouse().x,
				y: ref.mouse().y
			}),
			parse: (component) => ({
				x: component.pos.x,
				y: component.pos.y,
			})
		}
	};

	setType(type) {
		this.placement.size.x = 32;
		this.placement.size.y = 32;
		if (Editor.bodies[type] === undefined) return;
		this.placement.body = Editor.bodies[type];
	}
	
	setSnapSize(size) {
		this.placement.gridSize = size;
	}
 
	toggle(key) {
		this.toggleOptions[key] = !this.toggleOptions[key];
	}

	event() {
		if (
			mouseIsPressed &&
			this._timer > this._cooldown &&
			this.previous.mouseX !== mouseX &&
			this.previous.mouseY !== mouseY &&
			this.mouse().x < this.space.x &&
			this.mouse().y < this.space.y
		) {
			this.bodies.push(
				new this.placement.body.Component(
					this.world,
					this.placement.body.config(
						this,
						this.placement.size
					)
				)
			);
			this.previous.mouseX = this.mouse().x;
			this.previous.mouseY = this.mouse().y;

			this._timer = 0;
		} else {
			this._timer++;
		}
	}

	mouse() {
		return {
			x: (this.toggleOptions.snap) ? 
				round(mouseX / this.placement.gridSize) * this.placement.gridSize + this.placement.gridSize/2 
				: mouseX,
			y: (this.toggleOptions.snap) ? 
				round(mouseY / this.placement.gridSize) * this.placement.gridSize + this.placement.gridSize/2 
				: mouseY
		}
	}

	draw() {
		push();

		if (this.toggleOptions.grid) {
			this.drawGrid();
		}

		// Bodies
		this.bodies.forEach(body => {
			body.draw();
		});



		// Cursor
		fill(255, 100);
		noStroke();
		rectMode(CENTER);

		this.placement.body.shape(
			this.mouse().x,
			this.mouse().y,
			this.placement.size.x,
			this.placement.size.y
		);

		pop();

		stroke(0);
		noFill();
		rect(0, 0, this.space.x, this.space.y);

		noStroke();
		fill(51);

		rect(this.space.x, 0, this.window.x - this.space.x, this.window.y)	
		rect(0, this.space.y, this.window.x, this.window.y - this.space.y)
	}

	getData() {
		let data = this.bodies.map(o => {
			let data = this.placement.body.parse(o); 
			data.type = o.attributes.label.split(' ')[0];
			return data; 
		})
		return data;
	}

	drawGrid() {	
		push();

		stroke(60, 60, 60);
		for (let i = 0; i < this.window.x / this.placement.gridSize; i++) {
			line(i * this.placement.gridSize, 0, i * this.placement.gridSize, this.window.y);
		}

		for (let i = 0; i < this.window.y / this.placement.gridSize; i++) {
			line(0, i * this.placement.gridSize, this.window.x, i * this.placement.gridSize);
		}

		pop();
	}
}

function mouseWheel(e) {	
	let delta = e.delta/45;
	if (keyIsPressed) {	
		if (keyCode === 89) {
			editor.placement.size.y += abs(delta)/delta * editor.placement.gridSize * 2;
		} else if (keyCode === 88) {
			editor.placement.size.x += abs(delta)/delta * editor.placement.gridSize * 2;
		}
	} else {
		if (editor.placement.size.x >= delta)
			editor.placement.size.x += abs(delta)/delta * editor.placement.gridSize * 2;
		else
			editor.placement.size.x = abs(delta)/delta * editor.placement.gridSize * 2;

		if (editor.placement.size.y >= delta)
			editor.placement.size.y += abs(delta)/delta * editor.placement.gridSize * 2;
		else
			editor.placement.size.y = abs(delta)/delta * editor.placement.gridSize * 2;
	}
}

function mousePressed() {
	event.released = false;
}

function mouseReleased() {
	event.released = true;
}

let editor;
;
function setup() {
	editor = new Editor();

	createCanvas(
		editor.window.x,
		editor.window.y
	);
}

function draw() {
	background(51);

	editor.event();
	editor.draw();
}
