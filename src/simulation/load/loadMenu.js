
Simulation.loadSims = async function() {
	const menu = document.querySelector('.menu');
	const button = document.querySelector('.loadBtn');

	if (menu.style.display !== 'none') {

		menu.replaceChildren();
		menu.style.display = 'none';
		button.innerHTML = 'Load Simulation';
		return;
	}

	const data = await Server.http({
		ip: '127.0.0.1',
		port: '3000',
		path: 'getSimulations',
		method: 'get'
	});

	
	data.maps.forEach(map => {

		console.log(map);

		let mapDiv = document.createElement('div');
		mapDiv.setAttribute('class', 'element');
		mapDiv.setAttribute('onClick', `simulation.loadSimulation("${map.name}")`);

		let name = document.createElement('h4');
		name.innerHTML = map.name;
		let desc = document.createElement('p');
		desc.innerHTML = map.description;

		mapDiv.appendChild(name);
		mapDiv.appendChild(desc);

		menu.appendChild(mapDiv);
		menu.style.display = 'flex';

		button.innerHTML = 'Close';
	});	

}
