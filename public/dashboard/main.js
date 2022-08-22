const wnx = window.innerWidth,
	  wny = window.innerHeight;

let currentGen;
let currentIndex;

function setup() {
	createCanvas(wnx, wny);

	graph = new Graph({
		x: 10,
		y: 100,
		w: wnx-200,
		h: wny-310,
		xBounds: 100,
		yBounds: 100
	});

	fetch('http://192.168.1.201:3000/recieve', {
		method: 'get',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	})
	.then(res => res.json())
	.then(data => {
		console.log(data)
		graph.fromData(data.graph);
		currentIndex = data.meta.currentIndex;
		currentGen = data.meta.currentGen;
	})

}



function draw() {
	background(51);

	graph.draw();

	if (currentIndex !== undefined) {
		textSize(22);
		fill(255);
		text(`Current Gen: ${currentGen}`, 30, 30);
		text(`Current Creature: ${currentIndex}`, 30, 60);
	}	
}
