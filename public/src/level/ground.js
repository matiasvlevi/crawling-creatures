function makeGround(matter_world) {
	let ground = new Block(
		matter_world,
		{
			x: wnx,
			y: wny+190,
			w: wnx*10,
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

