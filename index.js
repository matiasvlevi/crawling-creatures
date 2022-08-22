const express = require('express');
const fs = require('node:fs');

const PORT = 3000;
const server = express();

server.use(express.json({limit: '5mb'}));
server.use(express.static('./public'));

server.listen(PORT, () => {
	console.log(`Listening on http://127.0.0.1:${PORT}`);
});

server.post('/upload', (req, res) => {
	console.log(req.body)

	fs.writeFileSync('./graph.json', JSON.stringify(req.body), 'utf-8')

	res.send(200)
})

server.get('/recieve', (req, res) => {

	if (!fs.existsSync('./graph.json')) {
		fs.writeFileSync('./graph.json', '{}', 'utf-8');
	}
	let file = fs.readFileSync('./graph.json', 'utf-8');

	res.send(file);
})
