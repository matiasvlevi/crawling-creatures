
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
			size: createVector(32, 32)
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
			config: (size) => ({
				x: mouseX,
				y: mouseY,
				w: size.x,
				h: size.y,
				color: '#222'
			})
		},
		Ball: {
			Component: Ball,
			shape: (function() {ellipse(...arguments)}),
			config: (size) => ({
				x: mouseX,
				y: mouseY,
				r: size.x/2,
				color: '#222'
			})
		},
		Spawnpoint: {
			Component: Spawnpoint,
			shape: (function() {Spawnpoint.draw(...arguments)}),
			config: () => ({
				x: mouseX,
				y: mouseY
			})
		}
	};

	setType(type) {
		if (Editor.bodies[type] === undefined) return;
		this.placement.body = Editor.bodies[type];
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
			mouseX < this.space.x &&
			mouseY < this.space.y
		) {
			this.bodies.push(
				new this.placement.body.Component(
					this.world,
					this.placement.body.config(
						this.placement.size
					)
				)
			);
			this.previous.mouseX = mouseX;
			this.previous.mouseY = mouseY;

			this._timer = 0;
		} else {
			this._timer++;
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
		rectMode(CENTER)
		this.placement.body.shape(
			mouseX,
			mouseY,
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
			let data = {
				x: o.body.position.x * 1.2,
				y: o.body.position.y * 1.2,
				type: o.body.label.split(' ')[0]
			};

			if (o.body.label.includes('Rectangle')) {
				data.w = o.attributes.w * 1.2;
				data.h = o.attributes.h * 1.2;
			} else if (o.body.label.includes('Circle')) {
				data.r = o.attributes.r * 1.2;
			}

			return data; 
		})
		return data;
	}

	drawGrid() {	
		push();

		stroke(60, 60, 60);
		for (let i = 0; i < this.window.x / 32; i++) {
			line(i * 32, 0, i * 32, this.window.y);
		}

		for (let i = 0; i < this.window.y / 32; i++) {
			line(0, i * 32, this.window.x, i * 32);
		}

		pop();
	}
}

function mouseWheel(e) {	
	let delta = e.delta/45;
	if (keyIsPressed) {	
		if (keyCode === 89) {
			editor.placement.size.y += delta;
		} else if (keyCode === 88) {
			editor.placement.size.x += delta;
		}
	} else {
		if (editor.placement.size.x >= delta)
			editor.placement.size.x += delta;
		else
			editor.placement.size.x = 12;

		if (editor.placement.size.y >= delta)
			editor.placement.size.y += delta;
		else
			editor.placement.size.y = 12;
	}
}

function mousePressed() {
	event.released = false;
}

function mouseReleased() {
	event.released = true;
}

let editor;
