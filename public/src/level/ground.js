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

