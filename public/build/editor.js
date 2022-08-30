/*!
 genetic-creatures v1.0.0 by Matias Vazquez-Levi 
 Build date: 2022-08-29
 License: MIT
*/
class Server {
	constructor() {}
	static async http ({
		ip,
		port,
		path,
		method,
		body
	}) {
		return fetch(`http://${ip}:${port}/${path}`, {
			method,
			body: body === undefined ? undefined : JSON.stringify(body),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}).then(res => res.json());
	}
};



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
		
		this.sideMenu = {
			distance: 1800,
			mutationRate: 1.5,
			firstPopulation: 128,
			population: 64,
			roundTime: 2000
		};
			
		this.bodies = [];

		this.release = true;
		this._timer = 0;
		this._cooldown = 10;

		this.spawnExists = false;
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
				x: component.body.position.x * 1.2,
				y: component.body.position.y * 1.2,
				w: component.attributes.w * 1.2,
				h: component.attributes.h * 1.2,
				type: component.body.label.split(' ')[0]
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
				x: component.body.position.x * 1.2,
				y: component.body.position.y * 1.2,
				r: component.attributes.r * 1.2,
				type: component.body.label.split(' ')[0]
			})
		},
		Spawnpoint: {
			Component: Spawnpoint,
			shape: (function() {Spawnpoint.draw(...arguments)}),
			config: (ref) => {
				ref.spawnExists = true;
				return {
					x: ref.mouse().x * 1.2,
					y: ref.mouse().y * 1.2
				}
			},
			parse: (component) => {
				return{
					x: component.pos.x,
					y: component.pos.y,
					type: 'Spawnpoint'
				}
			}
		}
	};

	getData() {
		let name = document.querySelector('#simulationName').value;
		let desc = document.querySelector('#simulationDescription').value; 
		return {
			bodies: this.bodies.map(
				o => Editor.bodies[o.constructor.name].parse(o)
			),
			meta: {
				description: desc.length !== 0 ? desc : 'No Description',
				name:  name.length !== 0 ? name : 'No Name'
			},
			metrics: {
				firstPopulation: document.querySelector('#firstPopulation').value,
				population:  document.querySelector('#population').value,
				distance:  document.querySelector('#distance').value,
				roundTime:  document.querySelector('#roundTime').value,
				mutationRate:  document.querySelector('#mutationRate').value
			}
		}
	}

	sendSimulationData() {
		Server.http({
			ip: '127.0.0.1',
			port: '3000',
			path: 'saveSimulation',
			method: 'post',
			body: this.getData()
		});	
	}

	setSideMenuValue(key, value) {
		this.sideMenu[key] = value;
	} 

	setType(type) {
		this.placement.size.x = this.placement.gridSize;
		this.placement.size.y = this.placement.gridSize;
		if (Editor.bodies[type] === undefined) return;
		this.placement.body = Editor.bodies[type];
	}
	
	setSnapSize(size) {
		this.placement.size.x = size;
		this.placement.size.y = size;
		this.placement.gridSize = size;
	}
 
	toggle(key) {
		this.toggleOptions[key] = !this.toggleOptions[key];
	}

	scaleBody(axis, delta) {
		if (this.placement.size[axis] >= this.placement.gridSize)
			this.placement.size[axis] += abs(delta)/delta * this.placement.gridSize * 2;
		else 
			this.placement.size[axis] = this.placement.gridSize;
	}	

	mouseWheel(e) {
		let delta = e.delta/45;
		if (
			keyIsPressed &&
			this.placement.body.Component.name != 'Ball' // Handle these exceptions a different way
		) {
			if (keyCode === 89) this.scaleBody('y', delta);
			else if (keyCode === 88) this.scaleBody('x', delta);
		} else {
			this.scaleBody('y', delta);
			this.scaleBody('x', delta);
		}
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
			if (!(this.placement.body.Component === Spawnpoint && this.spawnExists)) {
				// Push a new body
				this.bodies.push(
					new this.placement.body.Component(
						this.world,
						this.placement.body.config(
							this,
							this.placement.size
						)
					)
				);

			} else {
				// Move spawnpoint instead of pushing a new one
				for (key in this.bodies) {
					if (this.bodies[key] instanceof Spawnpoint) {
						this.bodies[key].pos.x = this.mouse().x;
						this.bodies[key].pos.y = this.mouse().y;
						break;
					}
				}
			}

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

		// Grid lines
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

		stroke(255, 0, 0);
		strokeWeight(2);
		line(this.sideMenu.distance/1.2, 0, this.sideMenu.distance/1.2, this.space.y);

		stroke(0);
		noFill();
		rect(0, 0, this.space.x, this.space.y);

		noStroke();
		fill(51);

		rect(this.space.x, 0, this.window.x - this.space.x, this.window.y)	
		rect(0, this.space.y, this.window.x, this.window.y - this.space.y)
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
	editor.mouseWheel(e);
}

function mousePressed() {
	event.released = false;
}

function mouseReleased() {
	event.released = true;
}

let editor;


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
