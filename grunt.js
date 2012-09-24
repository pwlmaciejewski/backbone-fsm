module.exports = function(grunt) {
	grunt.initConfig({
		test: {
			fsm: 'test/backbone-fsm-node.js'	
		},

		qunit: {
			fsm: 'test/backbone-fsm-browser.html'
		},

		watch: {
			coffee: {
				files: '<config:coffee.all.src>',
				tasks: 'coffee'
			}
		},

		coffee: {
			all: {
				src: ['lib/**/*.coffee', 'test/**/*.coffee'],
				dest: '<%= grunt.task.current.target %>',
				options: {
					bare: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-coffee');
	grunt.registerTask('alltests', 'test qunit');
	grunt.registerTask('default', '');
};