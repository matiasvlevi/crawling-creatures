function makeObstacles(sim) {
    let obstacles = [];
	for (let i = 0; i < 64; i++) {
		obstacles.push(
			new Block(sim.world, {
				x: random(450, i/4 * sim.distance),
				y: sim.window.y - random(-20,10),
				w: random(80, 130),
				h: random(80, 130),
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
