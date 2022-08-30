const express = require('express');
const fs = require('node:fs');

const PORT = 3000;
const server = express();

server.use(express.json({limit: '5mb'}));
server.use(express.static('./public'));

function writeIfNull(filename, boilerplate = '{}') {
	if (!fs.existsSync(filename)) {
		fs.writeFileSync(filename, boilerplate, 'utf-8');
	}
}

server.listen(PORT, () => {4
	console.log(`Listening on http://127.0.0.1:${PORT}`);
});

server.post('/saveSimulation', (req, res) => {
	console.log(`Simulation saved!`, req.body);

	writeIfNull('./maps.json');

	let data = JSON.parse(fs.readFileSync('./maps.json', 'utf-8'));

	data[req.body.meta.name] = req.body;

	fs.writeFileSync('./maps.json', JSON.stringify(data), 'utf-8');

	res.send(200);
})

server.get('/getSimulations', (req, res) => {
	
	writeIfNull('./maps.json');
	let data = JSON.parse(fs.readFileSync('./maps.json', 'utf-8'));	

	res.send(JSON.stringify({ 
		maps: Object.values(data).map(d => d.meta) 
	}));
})

server.get('/getSimulation', (req, res) => {
	let data = JSON.parse(fs.readFileSync('./maps.json', 'utf-8'))[req.query['id']];
	res.send(JSON.stringify(data));
})

server.post('/upload', (req, res) => {
	console.log(req.body)

	fs.writeFileSync('./graph.json', JSON.stringify(req.body), 'utf-8')

	res.send(200)
})

server.get('/recieve', (req, res) => {

	writeIfNull('./graph.json');
	let file = fs.readFileSync('./graph.json', 'utf-8');

	res.send(file);
})
