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
