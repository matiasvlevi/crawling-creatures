function makeObstacles(sim) {
    let obstacles = [];
	for (let i = 0; i < 64; i++) {
		obstacles.push(
			new Block(sim.world, {
				x: random(450, i/4 * sim.distance),
				y: sim.window.y - random(-50, 25),
				w: random(80, 140),
				h: random(80, 140),
				color: '#222'
			},
			{
				isStatic: true,
				angle: HALF_PI/random(1.1, 1.5)
			})
		);
	}

	// for (let i = 0; i < 12; i++) {
	// 	obstacles.push(
	// 		new Block(matter_world, {
	// 			x: random(1100, i/4 * distance + 200),
	// 			y: wny - random(210 + (i*15), 300 + (i*15)),
	// 			w: random(80, 140),
	// 			h: random(80, 140),
	// 			color: '#222'
	// 		},
	// 		{
	// 			isStatic: true,
	// 			angle: HALF_PI/random(1.1, 1.5)
	// 		})
	// 	);
	// }

	// for (let i = 0; i < 32; i++) {
	// 	obstacles.push(
	// 		new Block(matter_world, {
	// 			x: random(1100, i/4 * distance + 200),
	// 			y: wny - random(510 + (i*15), 600 + (i*15)),
	// 			w: random(80, 140),
	// 			h: random(80, 140),
	// 			color: '#222'
	// 		},
	// 		{
	// 			isStatic: true,
	// 			angle: HALF_PI/random(1.1, 1.5)
	// 		})
	// 	);
	// }
    return obstacles;
}
