const concatConfig = {
	editor: [
		'./src/lib/http.js',
		'./src/editor/spawnpoint.js',
		'./src/editor/editor.js',
		'./src/editor/main.js'
	],
	simulation:[
		'./src/lib/*.js',
		'./src/simulation/simulation.js',
		'./src/simulation/load/*.js',
		'./src/simulation/widgets/*.js',
		'./src/simulation/genetics/*.js',
		'./src/simulation/names/*.js',
		'./src/simulation/level/*.js',
		'./src/simulation/creature/*.js',
		'./src/creature/*.js',
		'./src/simulation/main.js'
	
	]
};


module.exports = function (grunt) {

	const config = {
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: '\n',
				banner: '/*!\n <%= pkg.name %> v<%= pkg.version %> by <%= pkg.author %> \n' +
						' Build date: <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
						' License: <%= pkg.license %>\n*/\n',
			},
			editor: {
				src: concatConfig.editor,
				dest: './public/build/editor.js'
			},
			simulation: {
				src: concatConfig.simulation,
				dest: './public/build/simulation.js'
			}
		},
		terser: {
			src: {
				files: [{
						src: './public/build/editor.js',
						dest: './public/build/editor.min.js'
					},
					{
						src: './public/build/simulation.js',
						dest: './public/build/simulation.min.js'
					}
				]	
			}
		}
	};

	grunt.initConfig(config);

	grunt.task.loadNpmTasks('grunt-contrib-concat');
	grunt.task.loadNpmTasks('grunt-terser');
	
	grunt.registerTask('default', ['concat', 'terser'])
};
