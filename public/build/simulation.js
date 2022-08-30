/*!
 genetic-creatures v1.0.0 by Matias Vazquez-Levi 
 Build date: 2022-08-30
 License: MIT
*/
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



class Simulation {
	constructor({
		mutationRate,
		distance,
		roundTime,
		firstPopulation,
		population
	}) {
		this.window = {
			x: window.innerWidth,
			y: window.innerHeight
		};

		this.spawn = {
			x: 260,
			y: this.window.y - 360
		}

		this.cycles = 1;

		this.mutationRate = mutationRate || 1.5;
		this.distance = distance || 1000;
		this.roundTime = roundTime || 2500;
		this.firstGenPop = firstPopulation || 128;
		this.genPop = population || 48;

		this._timer = 0;
		this.offset = 0;
		this.running = true;

		this.currentGen = 0;
		this.currentIndex = 0;
		this.bests = [];
		this.bestIndex = 0;
		this.bestScore = 0;

		this.engine = Matter.Engine.create({
			positionIterations: 4,
			velocityIterations: 4,
			constraintIterations: 7
		});
		this.world = this.engine.world;
		this.world.gravity.y = 1.5;

		let generation = this.makeRandomGeneration();
		
		this.baseStats = generation.defaultStats;
		this.graph = this.initGraph(generation);	

		this.creature = new Creature(
			this,
			this.spawn.x,
			this.spawn.y,
			random(3, 6),
			this.creatureConfigs[0], // CLEAN THIS CONSTRUCTOR
			this.creatureConfigs
		);

		this.obstacles = makeObstacles(this);
		this.obstacles.push(makeGround(this));

		this.btnIncrementCycle = new Button({
			x: 110,
			y: 215,
			w: 50,
			h: 50,
			text: '>',
			event: () => {
				if (this.cycles < 99)
					this.cycles += 1;
				else
					this.cycles = 100;
			}
		});

		this.btnDecrementCycle = new Button({
			x: 30,
			y: 215,
			w: 50,
			h: 50,
			text: '<',
			event: () => {
				if (this.cycles > 1)
					this.cycles -= 1;
				else
					this.cycles = 1;
			}
		});
	}

	initGraph(generation) {
		let graph = new Graph({
			x: this.window.x - 500,
			y: 20,
			w: 350,
			h: 350,
			yBounds: this.genPop,
			xBounds: 10
		});

		for (let i = 0; i < Object.keys(generation.stats).length; i++) {
			graph.addType(this.creatureConfigs[i].lastname);
		}
	
		graph.update(generation.stats);

		return graph;
	}

	update() {
		if (!this.running) return;

		for (let i = 0; i < this.cycles; i++) {
	
			Matter.Engine.update(this.engine);
			this.creature.update();

			if (
				this.creature.getPos() < this.offset ||
				this.creature.getPos() > this.distance * 1.1
			) {
				this.nextCreature();
				this._timer = 0;
			}

			if (this._timer > this.roundTime) {
				this._timer = 0;	
				this.nextCreature();
			} else {
				this._timer++; 
			};	
	
		}
	}

	draw() {
		push();
		translate(this.offset, 0);


		push();
		stroke(255, 0, 0);
		strokeWeight(3);
		noFill();
		ellipse(this.spawn.x, this.spawn.y, 260);
		pop();

		this.obstacles.forEach(o => o.draw());

		stroke(255, 0, 0, 80);
		strokeWeight(2);

		this.endLine();
		this.scoreBoard();

		if (this.running) this.creature.draw(); 

		pop();

		if (!this.running) this.endMessage();
		
		this.btnIncrementCycle.draw();
		this.btnDecrementCycle.draw();

		this.graph.draw();

	}

	events() {
		if (keyIsPressed) {
			if (keyCode === LEFT_ARROW) {
				this.offset += 20
			} else if (keyCode === RIGHT_ARROW) {
				this.offset -= 20;
			} else if (keyCode === DOWN_ARROW) {
				this.offset = 0;
			}
		}
	}
}

let simulation;


Simulation.loadSims = async function() {
	const menu = document.querySelector('.menu');
	const button = document.querySelector('.loadBtn');

	if (menu.style.display !== 'none') {

		menu.replaceChildren();
		menu.style.display = 'none';
		button.innerHTML = 'Load Simulation';
		return;
	}

	const data = await Server.http({
		ip: '127.0.0.1',
		port: '3000',
		path: 'getSimulations',
		method: 'get'
	});

	
	data.maps.forEach(map => {

		console.log(map);

		let mapDiv = document.createElement('div');
		mapDiv.setAttribute('class', 'element');
		mapDiv.setAttribute('onClick', `simulation.loadSimulation("${map.name}")`);

		let name = document.createElement('h4');
		name.innerHTML = map.name;
		let desc = document.createElement('p');
		desc.innerHTML = map.description;

		mapDiv.appendChild(name);
		mapDiv.appendChild(desc);

		menu.appendChild(mapDiv);
		menu.style.display = 'flex';

		button.innerHTML = 'Close';
	});	

}

Simulation.prototype.clearMatterBodies = function(bodies) {
	bodies.forEach(body => {
		Matter.World.remove(this.world, body.body);
	})
}

Simulation.prototype.makeObstaclesFrom = function(bodies) {
	let obstacles = [];
	bodies.forEach(body => {

		let Component;
		switch(body.type) {
			case 'Rectangle':
				Component = Block;
				break;
			case 'Circle':
				Component = Ball;
				break;
			case 'Spawnpoint':
				this.spawn.x = body.x;
				this.spawn.y = body.y;
				return;
			default:
				break;
		}

		delete body.type;
		body.color = '#222';
		obstacles.push(new Component(
			this.world, 
			body,
			{ isStatic: true }
		));
	});
	return obstacles;
}

Simulation.prototype.reloadSimulation = function(config) {
	this.cycles = 1;
	
	this.mutationRate = config.metrics.mutationRate || 1.5;
	this.distance = config.metrics.distance || 1000;
	this.roundTime = config.metrics.roundTime || 2500;
	this.firstGenPop = config.metrics.firstPopulation || 128;
	this.genPop = config.metrics.population || 48;

	this._timer = 0;
	this.offset = 0;
	this.running = true;

	this.currentGen = 0;
	this.currentIndex = 0;
	this.bests = [];
	this.bestIndex = 0;
	this.bestScore = 0;

	let generation = this.makeRandomGeneration();

	this.baseStats = generation.defaultStats;
	this.graph = this.initGraph(generation);	
	
	this.creature = new Creature(
		this,
		this.offset + 260,
		this.window.y - 360,
		random(3, 6),
		this.creatureConfigs[0], // CLEAN THIS CONSTRUCTOR
		this.creatureConfigs
	);

	this.clearMatterBodies(this.obstacles);
	this.obstacles = this.makeObstaclesFrom(config.bodies);
}

Simulation.prototype.loadSimulation = async function (name) {
	const data = await Server.http({
		ip: '127.0.0.1',
		port: '3000',
		path: `getSimulation?id=${name}`,
		method: 'get'
	});

	this.reloadSimulation(data);
}


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


Simulation.prototype.getBestCreatures = function() {
	let configs = [];
	for (let i = 0; i < this.bests.length; i++) {
		configs.push(this.creatureConfigs[this.bests.pop()])
	}
	return configs;
}


Simulation.prototype.makeRandomGeneration = function() {
	this.creatureConfigs = [];
	let defaultStats = {};

	for (let i = 0; i < this.firstGenPop; i++) {
		let config = Creature.genConfig(random(3, 6), this.creatureConfigs);
		this.creatureConfigs.push(config);

		if (defaultStats[config.lastname] === undefined)
			defaultStats[config.lastname] = 0;
		else
			defaultStats[config.lastname]++;
	}

    // Graph statistics
	let stats = {...defaultStats};
	for (let i = 0; i < this.firstGenPop; i++) {
		stats[this.creatureConfigs[i].lastname]++;
	}

	return  { stats, defaultStats };
}


Simulation.prototype.uploadGraph = function() {
	Server.http({
		ip: '127.0.0.1',
		port: '3000',
		method: 'post',
		path: 'upload',
		body: {
			graph: this.graph.toData(),
			meta: {
				currentGen: this.currentGen,
				currentIndex: this.currentIndex
			}
		}
	});
}

Simulation.prototype.newGeneration = function() {
	
	let stats = {...this.baseStats};

	let bestConfigs = this.getBestCreatures();
	this.creatureConfigs = [];

    if (bestConfigs.length === 0) return true;

	for (let i = 0; i < this.genPop; i++) {

		let oldConfig = bestConfigs[floor(random(0, bestConfigs.length-0.1))];
		let config = Creature.mutateConfig(this, oldConfig);

		this.creatureConfigs.push(config);

		if (stats[config.lastname] === undefined) 
			stats[config.lastname] = 1;
		else
			stats[config.lastname]++;
	}

    // Align screen
	if (this.distance > this.window.x - 200) {
		this.offset -= 25;
	}
	this.distance += 25;

    this.graph.update(stats);

    this.uploadGraph();

	return false;
}

let currentGen = 0;
let currentCreature = 0;
let currentIndex = 0;

Simulation.prototype.nextCreature = function() {
    // is creature passing?
	if (this.distance < this.creature.getPos()) {
		this.bests.push(this.currentIndex);

        // Creature Qualified message
        console.log(`${this.creature.config.lastname} Qualified !!!`);
		console.log(this.creature);
	}
	this.currentIndex++;

    // is new generation?
	if (this.currentIndex >= this.creatureConfigs.length) {
        
		if (this.newGeneration()) {
			this.running = false;
			return;
		}

        // Increment generation
        this.currentGen++;
        this.currentIndex = 0;

        this.bests = [];

        console.log(`Generation ${this.currentGen}`);
	}

    // Remove Creature's matter.js bodies
	this.creature.destructor();

	// Initialize new Creature
    this.creature = new Creature(
        this,
        this.spawn.x,
        this.spawn.y,
        5,
        this.creatureConfigs[this.currentIndex], // CLEAN THIS CONSTRUCTOR
        this.creatureConfigs
    );

    return true;
}

let NAMES = [
"Michael",
"Christopher",
"Jessica",
"Matthew",
"Ashley",
"Jennifer",
"Joshua",
"Amanda",
"Daniel",
"David",
"James",
"Robert",
"John",
"Joseph",
"Andrew",
"Ryan",
"Brandon",
"Jason",
"Justin",
"Sarah",
"William",
"Jonathan",
"Stephanie",
"Brian",
"Nicole",
"Nicholas",
"Anthony",
"Heather",
"Eric",
"Elizabeth",
"Adam",
"Megan",
"Melissa",
"Kevin",
"Steven",
"Thomas",
"Timothy",
"Christina",
"Kyle",
"Rachel",
"Laura",
"Lauren",
"Amber",
"Brittany",
"Danielle",
"Richard",
"Kimberly",
"Jeffrey",
"Amy",
"Crystal",
"Michelle",
"Tiffany",
"Jeremy",
"Benjamin",
"Mark",
"Emily",
"Aaron",
"Charles",
"Rebecca",
"Jacob",
"Stephen",
"Patrick",
"Sean",
"Erin",
"Zachary",
"Jamie",
"Kelly",
"Samantha",
"Nathan",
"Sara",
"Dustin",
"Paul",
"Angela",
"Tyler",
"Scott",
"Katherine",
"Andrea",
"Gregory",
"Erica",
"Mary",
"Travis",
"Lisa",
"Kenneth",
"Bryan",
"Lindsey",
"Kristen",
"Jose",
"Alexander",
"Jesse",
"Katie",
"Lindsay",
"Shannon",
"Vanessa",
"Courtney",
"Christine",
"Alicia",
"Cody",
"Allison",
"Bradley",
"Samuel",
"Shawn",
"April",
"Derek",
"Kathryn",
"Kristin",
"Chad",
"Jenna",
"Tara",
"Maria",
"Krystal",
"Jared",
"Anna",
"Edward",
"Julie",
"Peter",
"Holly",
"Marcus",
"Kristina",
"Natalie",
"Jordan",
"Victoria",
"Jacqueline",
"Corey",
"Keith",
"Monica",
"Juan",
"Donald",
"Cassandra",
"Meghan",
"Joel",
"Shane",
"Phillip",
"Patricia",
"Brett",
"Ronald",
"Catherine",
"George",
"Antonio",
"Cynthia",
"Stacy",
"Kathleen",
"Raymond",
"Carlos",
"Brandi",
"Douglas",
"Nathaniel",
"Ian",
"Craig",
"Brandy",
"Alex",
"Valerie",
"Veronica",
"Cory",
"Whitney",
"Gary",
"Derrick",
"Philip",
"Luis",
"Diana",
"Chelsea",
"Leslie",
"Caitlin",
"Leah",
"Natasha",
"Erika",
"Casey",
"Latoya",
"Erik",
"Dana",
"Victor",
"Brent",
"Dominique",
"Frank",
"Brittney",
"Evan",
"Gabriel",
"Julia",
"Candice",
"Karen",
"Melanie",
"Adrian",
"Stacey",
"Margaret",
"Sheena",
"Wesley",
"Vincent",
"Alexandra",
"Katrina",
"Bethany",
"Nichole",
"Larry",
"Jeffery",
"Curtis",
"Carrie",
"Todd",
"Blake",
"Christian",
"Randy",
"Dennis",
"Alison",
"Trevor",
"Seth",
"Kara",
"Joanna",
"Rachael",
"Luke",
"Felicia",
"Brooke",
"Austin",
"Candace",
"Jasmine",
"Jesus",
"Alan",
"Susan",
"Sandra",
"Tracy",
"Kayla",
"Nancy",
"Tina",
"Krystle",
"Russell",
"Jeremiah",
"Carl",
"Miguel",
"Tony",
"Alexis",
"Gina",
"Jillian",
"Pamela",
"Mitchell",
"Hannah",
"Renee",
"Denise",
"Molly",
"Jerry",
"Misty",
"Mario",
"Johnathan",
"Jaclyn",
"Brenda",
"Terry",
"Lacey",
"Shaun",
"Devin",
"Heidi",
"Troy",
"Lucas",
"Desiree",
"Jorge",
"Andre",
"Morgan",
"Drew",
"Sabrina",
"Miranda",
"Alyssa",
"Alisha",
"Teresa",
"Johnny",
"Meagan",
"Allen",
"Krista",
"Marc",
"Tabitha",
"Lance",
"Ricardo",
"Martin",
"Chase",
"Theresa",
"Melinda",
"Monique",
"Tanya",
"Linda",
"Kristopher",
"Bobby",
"Caleb",
"Ashlee",
"Kelli",
"Henry",
"Garrett",
"Mallory",
"Jill",
"Jonathon",
"Kristy",
"Anne",
"Francisco",
"Danny",
"Robin",
"Lee",
"Tamara",
"Manuel",
"Meredith",
"Colleen",
"Lawrence",
"Christy",
"Ricky",
"Randall",
"Marissa",
"Ross",
"Mathew",
"Jimmy",
"Abigail",
"Kendra",
"Carolyn",
"Billy",
"Deanna",
"Jenny",
"Jon",
"Albert",
"Taylor",
"Lori",
"Rebekah",
"Cameron",
"Ebony",
"Wendy",
"Angel",
"Micheal",
"Kristi",
"Caroline",
"Colin",
"Dawn",
"Kari",
"Clayton",
"Arthur",
"Roger",
"Roberto",
"Priscilla",
"Darren",
"Kelsey",
"Clinton",
"Walter",
"Louis",
"Barbara",
"Isaac",
"Cassie",
"Grant",
"Cristina",
"Tonya",
"Rodney",
"Bridget",
"Joe",
"Cindy",
"Oscar",
"Willie",
"Maurice",
"Jaime",
"Angelica",
"Sharon",
"Julian",
"Jack",
"Jay",
"Calvin",
"Marie",
"Hector",
"Kate",
"Adrienne",
"Tasha",
"Michele",
"Ana",
"Stefanie",
"Cara",
"Alejandro",
"Ruben",
"Gerald",
"Audrey",
"Kristine",
"Ann",
"Shana",
"Javier",
"Katelyn",
"Brianna",
"Bruce",
"Deborah",
"Claudia",
"Carla",
"Wayne",
"Roy",
"Virginia",
"Haley",
"Brendan",
"Janelle",
"Jacquelyn",
"Beth",
"Edwin",
"Dylan",
"Dominic",
"Latasha",
"Darrell",
"Geoffrey",
"Savannah",
"Reginald",
"Carly",
"Fernando",
"Ashleigh",
"Aimee",
"Regina",
"Mandy",
"Sergio",
"Rafael",
"Pedro",
"Janet",
"Kaitlin",
"Frederick",
"Cheryl",
"Autumn",
"Tyrone",
"Martha",
"Omar",
"Lydia",
"Jerome",
"Theodore",
"Abby",
"Neil",
"Shawna",
"Sierra",
"Nina",
"Tammy",
"Nikki",
"Terrance",
"Donna",
"Claire",
"Cole",
"Trisha",
"Bonnie",
"Diane",
"Summer",
"Carmen",
"Mayra",
"Jermaine",
"Eddie",
"Micah",
"Marvin",
"Levi",
"Emmanuel",
"Brad",
"Taryn",
"Toni",
"Jessie",
"Evelyn",
"Darryl",
"Ronnie",
"Joy",
"Adriana",
"Ruth",
"Mindy",
"Spencer",
"Noah",
"Raul",
"Suzanne",
"Sophia",
"Dale",
"Jodi",
"Christie",
"Raquel",
"Naomi",
"Kellie",
"Ernest",
"Jake",
"Grace",
"Tristan",
"Shanna",
"Hilary",
"Eduardo",
"Ivan",
"Hillary",
"Yolanda",
"Alberto",
"Andres",
"Olivia",
"Armando",
"Paula",
"Amelia",
"Sheila",
"Rosa",
"Robyn",
"Kurt",
"Dane",
"Glenn",
"Nicolas",
"Gloria",
"Eugene",
"Logan",
"Steve",
"Ramon",
"Bryce",
"Tommy",
"Preston",
"Keri",
"Devon",
"Alana",
"Marisa",
"Melody",
"Rose",
"Barry",
"Marco",
"Karl",
"Daisy",
"Leonard",
"Randi",
"Maggie",
"Charlotte"
];
let LAST_NAMES = [ 
"SMITH",
"JOHNSON",
"WILLIAMS",
"JONES",
"BROWN",
"DAVIS",
"MILLER",
"WILSON",
"MOORE",
"TAYLOR",
"ANDERSON",
"THOMAS",
"JACKSON",
"WHITE",
"HARRIS",
"MARTIN",
"THOMPSON",
"GARCIA",
"MARTINEZ",
"ROBINSON",
"CLARK",
"RODRIGUEZ",
"LEWIS",
"LEE",
"WALKER",
"HALL",
"ALLEN",
"YOUNG",
"HERNANDEZ",
"KING",
"WRIGHT",
"LOPEZ",
"HILL",
"SCOTT",
"GREEN",
"ADAMS",
"BAKER",
"GONZALEZ",
"NELSON",
"CARTER",
"MITCHELL",
"PEREZ",
"ROBERTS",
"TURNER",
"PHILLIPS",
"CAMPBELL",
"PARKER",
"EVANS",
"EDWARDS",
"COLLINS",
"STEWART",
"SANCHEZ",
"MORRIS",
"ROGERS",
"REED",
"COOK",
"MORGAN",
"BELL",
"MURPHY",
"BAILEY",
"RIVERA",
"COOPER",
"RICHARDSON",
"COX",
"HOWARD",
"WARD",
"TORRES",
"PETERSON",
"GRAY",
"RAMIREZ",
"JAMES",
"WATSON",
"BROOKS",
"KELLY",
"SANDERS",
"PRICE",
"BENNETT",
"WOOD",
"BARNES",
"ROSS",
"HENDERSON",
"COLEMAN",
"JENKINS",
"PERRY",
"POWELL",
"LONG",
"PATTERSON",
"HUGHES",
"FLORES",
"WASHINGTON",
"BUTLER",
"SIMMONS",
"FOSTER",
"GONZALES",
"BRYANT",
"ALEXANDER",
"RUSSELL",
"GRIFFIN",
"DIAZ",
"HAYES",
"MYERS",
"FORD",
"HAMILTON",
"GRAHAM",
"SULLIVAN",
"WALLACE",
"WOODS",
"COLE",
"WEST",
"JORDAN",
"OWENS",
"REYNOLDS",
"FISHER",
"ELLIS",
"HARRISON",
"GIBSON",
"MCDONALD",
"CRUZ",
"MARSHALL",
"ORTIZ",
"GOMEZ",
"MURRAY",
"FREEMAN",
"WELLS",
"WEBB",
"SIMPSON",
"STEVENS",
"TUCKER",
"PORTER",
"HUNTER",
"HICKS",
"CRAWFORD",
"HENRY",
"BOYD",
"MASON",
"MORALES",
"KENNEDY",
"WARREN",
"DIXON",
"RAMOS",
"REYES",
"BURNS",
"GORDON",
"SHAW",
"HOLMES",
"RICE",
"ROBERTSON",
"HUNT",
"BLACK",
"DANIELS",
"PALMER",
"MILLS",
"NICHOLS",
"GRANT",
"KNIGHT",
"FERGUSON",
"ROSE",
"STONE",
"HAWKINS",
"DUNN",
"PERKINS",
"HUDSON",
"SPENCER",
"GARDNER",
"STEPHENS",
"PAYNE",
"PIERCE",
"BERRY",
"MATTHEWS",
"ARNOLD",
"WAGNER",
"WILLIS",
"RAY",
"WATKINS",
"OLSON",
"CARROLL",
"DUNCAN",
"SNYDER",
"HART",
"CUNNINGHAM",
"BRADLEY",
"LANE",
"ANDREWS",
"RUIZ",
"HARPER",
"FOX",
"RILEY",
"ARMSTRONG",
"CARPENTER",
"WEAVER",
"GREENE",
"LAWRENCE",
"ELLIOTT",
"CHAVEZ",
"SIMS",
"AUSTIN",
"PETERS",
"KELLEY",
"FRANKLIN",
"LAWSON",
"FIELDS",
"GUTIERREZ",
"RYAN",
"SCHMIDT",
"CARR",
"VASQUEZ",
"CASTILLO",
"WHEELER",
"CHAPMAN",
"OLIVER",
"MONTGOMERY",
"RICHARDS",
"WILLIAMSON",
"JOHNSTON",
"BANKS",
"MEYER",
"BISHOP",
"MCCOY",
"HOWELL",
"ALVAREZ",
"MORRISON",
"HANSEN",
"FERNANDEZ",
"GARZA",
"HARVEY",
"LITTLE",
"BURTON",
"STANLEY",
"NGUYEN",
"GEORGE",
"JACOBS",
"REID",
"KIM",
"FULLER",
"LYNCH",
"DEAN",
"GILBERT",
"GARRETT",
"ROMERO",
"WELCH",
"LARSON",
"FRAZIER",
"BURKE",
"HANSON",
"DAY",
"MENDOZA",
"MORENO",
"BOWMAN",
"MEDINA",
"FOWLER",
"BREWER",
"HOFFMAN",
"CARLSON",
"SILVA",
"PEARSON",
"HOLLAND",
"DOUGLAS",
"FLEMING",
"JENSEN",
"VARGAS",
"BYRD",
"DAVIDSON",
"HOPKINS",
"MAY",
"TERRY",
"HERRERA",
"WADE",
"SOTO",
"WALTERS",
"CURTIS",
"NEAL",
"CALDWELL",
"LOWE",
"JENNINGS",
"BARNETT",
"GRAVES",
"JIMENEZ",
"HORTON",
"SHELTON",
"BARRETT",
"OBRIEN",
"CASTRO",
"SUTTON",
"GREGORY",
"MCKINNEY",
"LUCAS",
"MILES",
"CRAIG",
"RODRIQUEZ",
"CHAMBERS",
"HOLT",
"LAMBERT",
"FLETCHER",
"WATTS",
"BATES",
"HALE",
"RHODES",
"PENA",
"BECK",
"NEWMAN",
"HAYNES",
"MCDANIEL",
"MENDEZ",
"BUSH",
"VAUGHN",
"PARKS",
"DAWSON",
"SANTIAGO",
"NORRIS",
"HARDY",
"LOVE",
"STEELE",
"CURRY",
"POWERS",
"SCHULTZ",
"BARKER",
"GUZMAN",
"PAGE",
"MUNOZ",
"BALL",
"KELLER",
"CHANDLER",
"WEBER",
"LEONARD",
"WALSH",
"LYONS",
"RAMSEY",
"WOLFE",
"SCHNEIDER",
"MULLINS",
"BENSON",
"SHARP",
"BOWEN",
"DANIEL",
"BARBER",
"CUMMINGS",
"HINES",
"BALDWIN",
"GRIFFITH",
"VALDEZ",
"HUBBARD",
"SALAZAR",
"REEVES",
"WARNER",
"STEVENSON",
"BURGESS",
"SANTOS",
"TATE",
"CROSS",
"GARNER",
"MANN",
"MACK",
"MOSS",
"THORNTON",
"DENNIS",
"MCGEE",
"FARMER",
"DELGADO",
"AGUILAR",
"VEGA",
"GLOVER",
"MANNING",
"COHEN",
"HARMON",
"RODGERS",
"ROBBINS",
"NEWTON",
"TODD",
"BLAIR",
"HIGGINS",
"INGRAM",
"REESE",
"CANNON",
"STRICKLAND",
"TOWNSEND",
"POTTER",
"GOODWIN",
"WALTON",
"ROWE",
"HAMPTON",
"ORTEGA",
"PATTON",
"SWANSON",
"JOSEPH",
"FRANCIS",
"GOODMAN",
"MALDONADO",
"YATES",
"BECKER",
"ERICKSON",
"HODGES",
"RIOS",
"CONNER",
"ADKINS",
"WEBSTER",
"NORMAN",
"MALONE",
"HAMMOND",
"FLOWERS",
"COBB",
"MOODY",
"QUINN",
"BLAKE",
"MAXWELL",
"POPE",
"FLOYD",
"OSBORNE",
"PAUL",
"MCCARTHY",
"GUERRERO",
"LINDSEY",
"ESTRADA",
"SANDOVAL",
"GIBBS",
"TYLER",
"GROSS",
"FITZGERALD",
"STOKES",
"DOYLE",
"SHERMAN",
"SAUNDERS",
"WISE",
"COLON",
"GILL",
"ALVARADO",
"GREER",
"PADILLA",
"SIMON",
"WATERS",
"NUNEZ",
"BALLARD",
"SCHWARTZ",
"MCBRIDE",
"HOUSTON",
"CHRISTENSEN",
"KLEIN",
"PRATT",
"BRIGGS",
"PARSONS",
"MCLAUGHLIN",
"ZIMMERMAN",
"FRENCH",
"BUCHANAN",
"MORAN",
"COPELAND",
"ROY",
"PITTMAN",
"BRADY",
"MCCORMICK",
"HOLLOWAY",
"BROCK",
"POOLE",
"FRANK",
"LOGAN",
"OWEN",
"BASS",
"MARSH",
"DRAKE",
"WONG",
"JEFFERSON",
"PARK",
"MORTON",
"ABBOTT",
"SPARKS",
"PATRICK",
"NORTON",
"HUFF",
"CLAYTON",
"MASSEY",
"LLOYD",
"FIGUEROA",
"CARSON",
"BOWERS",
"ROBERSON",
"BARTON",
"TRAN",
"LAMB",
"HARRINGTON",
"CASEY",
"BOONE",
"CORTEZ",
"CLARKE",
"MATHIS",
"SINGLETON",
"WILKINS",
"CAIN",
"BRYAN",
"UNDERWOOD",
"HOGAN",
"MCKENZIE",
"COLLIER",
"LUNA",
"PHELPS",
"MCGUIRE",
"ALLISON",
"BRIDGES",
"WILKERSON",
"NASH",
"SUMMERS",
"ATKINS",
"WILCOX",
"PITTS",
"CONLEY",
"MARQUEZ",
"BURNETT",
"RICHARD",
"COCHRAN",
"CHASE",
"DAVENPORT",
"HOOD",
"GATES",
"CLAY",
"AYALA",
"SAWYER",
"ROMAN",
"VAZQUEZ",
"DICKERSON",
"HODGE",
"ACOSTA",
"FLYNN",
"ESPINOZA",
"NICHOLSON",
"MONROE",
"WOLF",
"MORROW",
"KIRK",
"RANDALL",
"ANTHONY",
"WHITAKER",
"OCONNOR",
"SKINNER",
"WARE",
"MOLINA",
"KIRBY",
"HUFFMAN",
"BRADFORD",
"CHARLES",
"GILMORE",
"DOMINGUEZ",
"ONEAL",
"BRUCE",
"LANG",
"COMBS",
"KRAMER",
"HEATH",
"HANCOCK",
"GALLAGHER",
"GAINES",
"SHAFFER",
"SHORT",
"WIGGINS",
"MATHEWS",
"MCCLAIN",
"FISCHER",
"WALL",
"SMALL",
"MELTON",
"HENSLEY",
"BOND",
"DYER",
"CAMERON",
"GRIMES",
"CONTRERAS",
"CHRISTIAN",
"WYATT",
"BAXTER",
"SNOW",
"MOSLEY",
"SHEPHERD",
"LARSEN",
"HOOVER",
"BEASLEY",
"GLENN",
"PETERSEN",
"WHITEHEAD",
"MEYERS",
"KEITH",
"GARRISON",
"VINCENT",
"SHIELDS",
"HORN",
"SAVAGE",
"OLSEN",
"SCHROEDER",
"HARTMAN",
"WOODARD",
"MUELLER",
"KEMP",
"DELEON",
"BOOTH",
"PATEL",
"CALHOUN",
"WILEY",
"EATON",
"CLINE",
"NAVARRO",
"HARRELL",
"LESTER",
"HUMPHREY",
"PARRISH",
"DURAN",
"HUTCHINSON",
"HESS",
"DORSEY",
"BULLOCK",
"ROBLES",
"BEARD",
"DALTON",
"AVILA",
"VANCE",
"RICH",
"BLACKWELL",
"YORK",
"JOHNS",
"BLANKENSHIP",
"TREVINO",
"SALINAS",
"CAMPOS",
"PRUITT",
"MOSES",
"CALLAHAN",
"GOLDEN",
"MONTOYA",
"HARDIN",
"GUERRA",
"MCDOWELL",
"CAREY",
"STAFFORD",
"GALLEGOS",
"HENSON",
"WILKINSON",
"BOOKER",
"MERRITT",
"MIRANDA",
"ATKINSON",
"ORR",
"DECKER",
"HOBBS",
"PRESTON",
"TANNER",
"KNOX",
"PACHECO",
"STEPHENSON",
"GLASS",
"ROJAS",
"SERRANO",
"MARKS",
"HICKMAN",
"ENGLISH",
"SWEENEY",
"STRONG",
"PRINCE",
"MCCLURE",
"CONWAY",
"WALTER",
"ROTH",
"MAYNARD",
"FARRELL",
"LOWERY",
"HURST",
"NIXON",
"WEISS",
"TRUJILLO",
"ELLISON",
"SLOAN",
"JUAREZ",
"WINTERS",
"MCLEAN",
"RANDOLPH",
"LEON",
"BOYER",
"VILLARREAL",
"MCCALL",
"GENTRY",
"CARRILLO",
"KENT",
"AYERS",
"LARA",
"SHANNON",
"SEXTON",
"PACE",
"HULL",
"LEBLANC",
"BROWNING",
"VELASQUEZ",
"LEACH",
"CHANG",
"HOUSE",
"SELLERS",
"HERRING",
"NOBLE",
"FOLEY",
"BARTLETT",
"MERCADO",
"LANDRY",
"DURHAM",
"WALLS",
"BARR",
"MCKEE",
"BAUER",
"RIVERS",
"EVERETT",
"BRADSHAW",
"PUGH",
"VELEZ",
"RUSH",
"ESTES",
"DODSON",
"MORSE",
"SHEPPARD",
"WEEKS",
"CAMACHO",
"BEAN",
"BARRON",
"LIVINGSTON",
"MIDDLETON",
"SPEARS",
"BRANCH",
"BLEVINS",
"CHEN",
"KERR",
"MCCONNELL",
"HATFIELD",
"HARDING",
"ASHLEY",
"SOLIS",
"HERMAN",
"FROST",
"GILES",
"BLACKBURN",
"WILLIAM",
"PENNINGTON",
"WOODWARD",
"FINLEY",
"MCINTOSH",
"KOCH",
"BEST",
"SOLOMON",
"MCCULLOUGH",
"DUDLEY",
"NOLAN",
"BLANCHARD",
"RIVAS",
"BRENNAN",
"MEJIA",
"KANE",
"BENTON",
"JOYCE",
"BUCKLEY",
"HALEY",
"VALENTINE",
"MADDOX",
"RUSSO",
"MCKNIGHT",
"BUCK",
"MOON",
"MCMILLAN",
"CROSBY",
"BERG",
"DOTSON",
"MAYS",
"ROACH",
"CHURCH",
"CHAN",
"RICHMOND",
"MEADOWS",
"FAULKNER",
"ONEILL",
"KNAPP",
"KLINE",
"BARRY",
"OCHOA",
"JACOBSON",
"GAY",
"AVERY",
"HENDRICKS",
"HORNE",
"SHEPARD",
"HEBERT",
"CHERRY",
"CARDENAS",
"MCINTYRE",
"WHITNEY",
"WALLER",
"HOLMAN",
"DONALDSON",
"CANTU",
"TERRELL",
"MORIN",
"GILLESPIE",
"FUENTES",
"TILLMAN",
"SANFORD",
"BENTLEY",
"PECK",
"KEY",
"SALAS",
"ROLLINS",
"GAMBLE",
"DICKSON",
"BATTLE",
"SANTANA",
"CABRERA",
"CERVANTES",
"HOWE",
"HINTON",
"HURLEY",
"SPENCE",
"ZAMORA",
"YANG",
"MCNEIL",
"SUAREZ",
"CASE",
"PETTY",
"GOULD",
"MCFARLAND",
"SAMPSON",
"CARVER",
"BRAY",
"ROSARIO",
"MACDONALD",
"STOUT",
"HESTER",
"MELENDEZ",
"DILLON",
"FARLEY",
"HOPPER",
"GALLOWAY",
"POTTS",
"BERNARD",
"JOYNER",
"STEIN",
"AGUIRRE",
"OSBORN",
"MERCER",
"BENDER",
"FRANCO",
"ROWLAND",
"SYKES",
"BENJAMIN",
"TRAVIS",
"PICKETT",
"CRANE",
"SEARS",
"MAYO",
"DUNLAP",
"HAYDEN",
"WILDER",
"MCKAY",
"COFFEY",
"MCCARTY",
"EWING",
"COOLEY",
"VAUGHAN",
"BONNER",
"COTTON",
"HOLDER",
"STARK",
"FERRELL",
"CANTRELL",
"FULTON",
"LYNN",
"LOTT",
"CALDERON",
"ROSA",
"POLLARD",
"HOOPER",
"BURCH",
"MULLEN",
"FRY",
"RIDDLE",
"LEVY",
"DAVID",
"DUKE",
"ODONNELL",
"GUY",
"MICHAEL",
"BRITT",
"FREDERICK",
"DAUGHERTY",
"BERGER",
"DILLARD",
"ALSTON",
"JARVIS",
"FRYE",
"RIGGS",
"CHANEY",
"ODOM",
"DUFFY",
"FITZPATRICK",
"VALENZUELA",
"MERRILL",
"MAYER",
"ALFORD",
"MCPHERSON",
"ACEVEDO",
"DONOVAN",
"BARRERA",
"ALBERT",
"COTE",
"REILLY",
"COMPTON",
"RAYMOND",
"MOONEY",
"MCGOWAN",
"CRAFT",
"CLEVELAND",
"CLEMONS",
"WYNN",
"NIELSEN",
"BAIRD",
"STANTON",
"SNIDER",
"ROSALES",
"BRIGHT",
"WITT",
"STUART",
"HAYS",
"HOLDEN",
"RUTLEDGE",
"KINNEY",
"CLEMENTS",
"CASTANEDA",
"SLATER",
"HAHN",
"EMERSON",
"CONRAD",
"BURKS",
"DELANEY",
"PATE",
"LANCASTER",
"SWEET",
"JUSTICE",
"TYSON",
"SHARPE",
"WHITFIELD",
"TALLEY",
"MACIAS",
"IRWIN",
"BURRIS",
"RATLIFF",
"MCCRAY",
"MADDEN",
"KAUFMAN",
"BEACH",
"GOFF",
"CASH",
"BOLTON",
"MCFADDEN",
"LEVINE",
"GOOD",
"BYERS",
"KIRKLAND",
"KIDD",
"WORKMAN",
"CARNEY",
"DALE",
"MCLEOD",
"HOLCOMB",
"ENGLAND",
"FINCH",
"HEAD",
"BURT",
"HENDRIX",
"SOSA",
"HANEY",
"FRANKS",
"SARGENT",
"NIEVES",
"DOWNS",
"RASMUSSEN",
"BIRD",
"HEWITT",
"LINDSAY",
"LE",
"FOREMAN",
"VALENCIA",
"ONEIL",
"DELACRUZ",
"VINSON",
"DEJESUS",
"HYDE",
"FORBES",
"GILLIAM",
"GUTHRIE",
"WOOTEN",
"HUBER",
"BARLOW",
"BOYLE",
"MCMAHON",
"BUCKNER",
"ROCHA",
"PUCKETT",
"LANGLEY",
"KNOWLES",
"COOKE",
"VELAZQUEZ",
"WHITLEY",
"NOEL",
"VANG",
"SHEA",
"ROUSE",
"HARTLEY",
"MAYFIELD",
"ELDER",
"RANKIN",
"HANNA",
"COWAN",
"LUCERO",
"ARROYO",
"SLAUGHTER",
"HAAS",
"OCONNELL",
"MINOR",
"KENDRICK",
"SHIRLEY",
"KENDALL",
"BOUCHER",
"ARCHER",
"BOGGS",
"ODELL",
"DOUGHERTY",
"ANDERSEN",
"NEWELL",
"CROWE",
"WANG",
"FRIEDMAN",
"BLAND",
"SWAIN",
"HOLLEY",
"FELIX",
"PEARCE",
"CHILDS",
"YARBROUGH",
"GALVAN",
"PROCTOR",
"MEEKS",
"LOZANO",
"MORA",
"RANGEL",
"BACON",
"VILLANUEVA",
"SCHAEFER",
"ROSADO",
"HELMS",
"BOYCE",
"GOSS",
"STINSON",
"SMART",
"LAKE",
"IBARRA",
"HUTCHINS",
"COVINGTON",
"REYNA",
"GREGG",
"WERNER",
"CROWLEY",
"HATCHER",
"MACKEY",
"BUNCH",
"WOMACK",
"POLK"
];

// Find different name
function exists(name, c) {
	let a = Object.values(c).map(m => m.lastname);
	return a.includes(name)
}

function getLastName(creatures) {
	let fullname;

	let i = 0;
	do {
		let name = LAST_NAMES[floor(random(0, LAST_NAMES.length-1))];
		name = name.toLocaleLowerCase();
	
		let namearr = name.split('')

		namearr[0] = namearr[0].toLocaleUpperCase();

		fullname = namearr.join('');
		i++
	} while(exists(fullname, creatures))		

	return fullname;
}

function makeGround(sim) {
	let ground = new Block(
		sim.world,
		{
			x: sim.window.x,
			y: sim.window.y + 190,
			w: sim.window.x * 10,
			h: 500,
			color: '#222'
		},
		{
			isStatic: true
		}
	);
    ground.body.friction = 1;
	ground.body.frictionStatic = 1;
    return ground;
}


function makeObstacles(sim) {
    let obstacles = [];
	for (let i = 0; i < 64; i++) {
		obstacles.push(
			new Block(sim.world, {
				x: random(0, (i+1)/8 * sim.distance) + 900,
				y: sim.window.y - random(-40, 10),
				w: random(110, 150),
				h: random(110, 150),
				color: '#222'
			},
			{
				isStatic: true,
				angle: HALF_PI/random(1.1, 1.2)
			})
		);
	}

    return obstacles;
}

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
			//this.masses[i].body.mass = beats[i].mass;
			this.masses[i].body.slop = 0.9;
			this.masses[i].body.density = Infinity;
			this.masses[i].body.restitution = 1;

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
				initial: random(14, 90),
				stiffness: random(0.05, 0.1),
				damping: random(0, 1.5),
				friction: random(0, 1),
				mass: random(100, 800),
				contraction: random(0.87, 0.99)
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
				stiffness: random(0.05, 0.1),
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

		push();

		fill(255)
		textSize(32);
		noStroke();
		text(`${this.name} ${this.config.lastname}`, this.masses[0].body.position.x, this.masses[0].body.position.y - 100);

		pop();

		this.masses.forEach(m => m.drawConstraints());
		this.masses.forEach(m => m.draw());
	}
}


function setup() {
	simulation = new Simulation({
		distance: 1000,
		roundTime: 2000,
		mutationRate: 1.5,
		firstPopulation: 128,
		population: 64
	});	

	createCanvas(
		simulation.window.x,
		simulation.window.y
	);	
}

function draw() {
	background(51);	
	simulation.events();
	simulation.update();

	simulation.draw();
}

