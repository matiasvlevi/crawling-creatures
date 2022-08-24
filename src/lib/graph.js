class Graph {
	constructor({x, y, w, h, xBounds, yBounds}) {
		this.pos = createVector(x, y);
		this.size = createVector(w, h);
		this.bounds = createVector(xBounds, yBounds);
	
		this.data = {};
		this.colors = {};


		this.length = 0;
	}

	static genColor() {
		let accent = floor(random(0, 3));

		return color(
			random(accent == 0 ? 155 : 0, accent == 0 ? 255 : 105),
			random(accent == 1 ? 155 : 0, accent == 1 ? 255 : 105),
			random(accent == 2 ? 155 : 0, accent == 2 ? 255 : 105)
		);
	}

	toData() {
		return {
			data: this.data,
			colors: this.colors,
			length: this.length,
			bound: this.bounds.y
		};
	}

	fromData(json) {
		let data = json;

		let colors = {};

		for (key in data.colors) {
			this.colors[key] = color(...data.colors[key].levels);
		}

		this.data = data.data;
		this.length = data.length;
		this.bounds.y = data.bound;
	}

	addType(key, color = Graph.genColor()) {
		this.data[key] = [];
		this.colors[key] = color;
	}

	insert(key, next) {
		this.addType(key);
		this.data[key] = new Array(this.length-1).fill(0);
		this.data[key].push(next);

		let sum = 0;
		for (key in this.data) {
			sum += this.data[key][this.length-1]
		}

		for (key in this.data) {
			this.data[key][this.length-1] = this.data[key][this.length-1]/sum * this.bounds.y;
		}

	}

	update(values) {
		let sum = 0;
		for (key in values) {
			sum += values[key];
		}

		// Append data
		for (key in values) {
			this.data[key].push(values[key] / sum * this.bounds.y);
		}

		this.length++;
	}

	scale(value) {
		return (value / this.bounds.y * this.size.y);
	}

	draw() {
		push();
		stroke(200);

		// Axes
		line(this.pos.x, this.pos.y, this.pos.x, this.pos.y + this.size.y);
		line(this.pos.x, this.pos.y + this.size.y, this.pos.x + this.size.x, this.pos.y + this.size.y);
	
		// Indicators
		noStroke();
		fill(200);
		textSize(12);
		text(this.length-1, this.pos.x + this.size.x - 12, this.pos.y + this.size.y - 4);
		text(this.bounds.y, this.pos.x + 4, this.pos.y);


		// data
		let keys = Object.keys(this.data);

		let sum = new Array(this.length).fill(0);
		for (let i = 0; i < keys.length; i++) {
			fill(this.colors[keys[i]]);

			beginShape();

			vertex(
				this.pos.x,
				this.pos.y + this.scale(sum[0])
			);

			for (let j = 1; j < this.length; j++) {
				vertex(
					this.pos.x + (j / (this.length-1) * this.size.x),
					this.pos.y + this.scale(sum[j]) 
				);
			}

			for (let j = this.length; j > 0; j--) {
				vertex(
					this.pos.x + (j / (this.length-1) * this.size.x),
					this.pos.y + this.scale(sum[j] + this.data[keys[i]][j])
				);
			}

			vertex(
				this.pos.x,
				this.pos.y + this.scale(sum[0] + this.data[keys[i]][0]) 
			);

			endShape(OPEN);

			noStroke();
			fill(255)

			if (this.data[keys[i]][this.length-1] > 0) {
				textAlign(LEFT)
				text(keys[i], 
					this.pos.x + this.size.x + 12,
					this.pos.y + this.scale(sum[this.length-1] + this.data[keys[i]][this.length-1]/2)
				);
			}
			for (let j = 1; j < this.length; j++) {
				sum[j] += this.data[keys[i]][j];
			}

			sum[0] += this.data[keys[i]][0];

		}
		
		pop();
	}
}
