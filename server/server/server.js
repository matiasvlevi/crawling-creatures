const fs = require('node:fs');

class Server {
	constructor() {}

	static db = {
		maps: (user) => `maps/${user}.json`
	};

	static writeIfNull(path) {
		if (!fs.existsSync(`./data/${path}`)) {
			fs.writeFileSync(
				`./data/${path}`,
				'{}',
				'utf-8'
			);
		}
	}

	getUserSimulations(req, res) {
		const path = Server.db.maps(req.body.user);
		Server.writeIfNull();	
	}
}
