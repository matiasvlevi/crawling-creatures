class Creature {
	constructor(simulation, x = 0, y = 0, n = 2, config = undefined, others = undefined) {
	
		this.simulation = simulation;
		this.masses = [];
		this.pos = createVector(x,y);

		this.name = NAMES[floor(random(0, NAMES.length-1))];

		this.heartBeats = [];

		this.rad = 260;
		this.config = {};
		if (config === undefined) {
			config = {};
			config.n = n;
		}

		if (config.beats === undefined) config = this.initConfig(n, others);
		this.init(config);
	}
	getPos() {
		return this.masses[0].body.position.x;
	}
	initConfig(n, others) {
		return Creature.genConfig(n, others);
	}
	getConfig() {
		return this.config;
	}
	init({ links, beats, lastname }) {
		this.config = {links, beats, lastname, n: beats.length};
		for (let i = 0; i < beats.length; i++) {
			this.masses.push(
				new Ball(this.simulation.world, {
					x: random(this.pos.x - this.rad, this.pos.x + this.rad),
					y: random(this.pos.y - this.rad, this.pos.y + this.rad),
					r: 8,
					color: 'white',
					mass: 100,
				})
			);
			this.heartBeats[i] = beats[i];
			let color = (floor(beats[i].friction * 100 + 155)).toString(16);
			this.masses[i].body.frictionStatic = beats[i].friction;
			this.masses[i].body.friction = beats[i].friction;
			this.masses[i].attributes.color = `#${color}${color}${color}`
			this.masses[i].body.mass = beats[i].mass;

		}	
		for (let j = 0; j < links.length; j++) {
			this.masses[links[j].A].constrainTo(
				this.masses[links[j].B],
				{
					length: this.heartBeats[links[j].A].initial,
					stiffness: this.heartBeats[links[j].A].stiffness,
					damping:this.heartBeats[links[j].A].damping
				}
			);
		}
	}

	static genConfig(n, others) {
		let links = [];
		let beats = [];
		for (let i = 0; i < n; i++) {
			beats.push({
				rate: random(4, 64),
				current: 0,
				initial: random(12, 160),
				stiffness: random(0.05, 0.4),
				damping: random(0, 1.5),
				friction: random(0, 1),
				mass: random(10, 1500),
				contraction: random(0.9, 1.1)
			});
			for (let j = 0; j < floor(random(2, n+1)); j++) {
				let ran = 0;
				do {
					ran = floor(random(0, n))
				} while (ran === i);

				links.push({
					A: i,
					B: ran,
					data: {
						length: beats[i].initial,
						stiffness: beats[i].stiffness,
						damping: beats[i].damping				
					}
				})
			}
		}
		return {links, beats, n, lastname: getLastName(others)}

	}
	destructor() {
		this.masses.forEach(m => {
			m.constraints.forEach(c => {
				Matter.World.remove(this.simulation.world, c);
			});
			Matter.World.remove(this.simulation.world, m.body)
		});
	}

	static getAvailableMutationName(baseStats, lastname, index) {
		let mutationCode = ` ${String.fromCharCode(index)}`;

		while (baseStats[lastname + mutationCode] !== undefined) {
			mutationCode = ` ${String.fromCharCode(index)}`
			index++;
		}

		return mutationCode;
	}

	static mutateConfig(simulation, _config) {

		const config = { ..._config };
		config.beats = [..._config.beats];
		config.links = [..._config.links];
		config.beats.map((b) => {
			let r = {...b};
			r.rate = b.rate + (b.rate/100) * (round(random(0, 1)) == 0 ? -1 : 1)
			r.mass = b.mass + (b.mass/100) * (round(random(0, 1)) == 0 ? -1 : 1)
			r.initial = b.initial + (b.initial/100) * (round(random(0,1)) == 0 ? -1 : 1)
			r.friction = b.friction + (b.friction/100) * (round(random(0,1)) == 0 ? -1 : 1)
			r.damping = b.damping + (b.damping/100) * (round(random(0,1)) == 0 ? -1 : 1)
			return r;
		})

		let massMutation = random(0, 100) < simulation.mutationRate;
		let springMutation = random(0, 100) < simulation.mutationRate*2;
		if (massMutation) {
			config.beats.push({
				rate: random(4, 64),
				current: 0,
				initial: random(12, 160),
				stiffness: random(0.05, 0.4),
				damping: random(0, 1.5),
				friction: random(0, 1),
				mass: random(10, 1500),
				contraction: random(0.9, 1.1)
			});
			for (let j = 0; j < floor(random(1, config.n)); j++) {
				let ran = 0;
				do {
					ran = floor(random(0, config.n))
				} while (ran === config.beats.length-1);

				config.links.push({
					A: config.beats.length-1,
					B: ran,
					data: {
						length: config.beats[config.beats.length-1].initial,
						stiffness: config.beats[config.beats.length-1].stiffness,
						damping: config.beats[config.beats.length-1].damping				
					}
				})
			}
			config.n++;


			config.lastname += Creature.getAvailableMutationName(
				simulation.baseStats,
				config.lastname,
				97
			);
		
			simulation.graph.insert(config.lastname, 1);
			simulation.baseStats[config.lastname] = 0;

		} else if (springMutation) {
			for (let j = 0; j < floor(random(1, config.n)); j++) {
				let ranA = floor(random(0, config.n));
				let ranB = 0;
				do {
					ranB = floor(random(0, config.n))
				} while (ranA === ranB);

				config.links.push({
					A: ranA,
					B: ranB,
					data: {
						length: config.beats[ranA].initial,
						stiffness: config.beats[ranA].stiffness,
						damping: config.beats[ranA].damping				
					}
				})
			}
				
			config.lastname += Creature.getAvailableMutationName(
				simulation.baseStats,
				config.lastname,
				97
			);

			simulation.graph.insert(config.lastname, 1);
			simulation.baseStats[config.lastname] = 0;
		}

		return config;
	}

	update() {
		this.masses.forEach((m, i) => {
			if (this.heartBeats[i].rate <= this.heartBeats[i].current) {
				m.constraints.forEach(c => {
					c.length = this.heartBeats[i].initial;
				})
					
				this.heartBeats[i].current = 0;
			} else if(
				this.heartBeats[i].rate < this.heartBeats[i].current + 10 &&
				this.heartBeats[i].rate > this.heartBeats[i].current
			) {
				m.constraints.forEach(c => {
					c.length *= this.heartBeats[i].contraction
				})

				this.heartBeats[i].current++;

			} else {
				this.heartBeats[i].current++;
			}
		})
	}	

	draw() {

		fill(255)
		textSize(32);
		text(`${this.name} ${this.config.lastname}`, this.masses[0].body.position.x, this.masses[0].body.position.y - 100);

		this.masses.forEach(m => m.drawConstraints());
		this.masses.forEach(m => m.draw());
	}
}
