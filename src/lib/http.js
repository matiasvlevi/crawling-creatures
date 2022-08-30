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

