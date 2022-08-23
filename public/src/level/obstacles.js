function makeObstacles(sim) {
    let obstacles = [];
	for (let i = 0; i < 64; i++) {
		obstacles.push(
			new Block(sim.world, {
				x: random(0, (i+1)/4 * sim.distance) + 850,
				y: sim.window.y - random(-15, 10),
				w: random(80, 120),
				h: random(80, 120),
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
