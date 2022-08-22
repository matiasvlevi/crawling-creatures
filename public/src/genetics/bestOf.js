let bestScore = 0;
let bestIndex = 0;
let bests = [];

function bestOf(creatures) {
	let configs = [];
	for (let i = 0; i < bests.length; i++) {
		configs.push(creatures[bests.pop()])
	}
	return configs;
}