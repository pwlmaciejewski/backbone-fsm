module.exports = function(grunt) {
	grunt.initConfig({
		test: {
			node: 'test/node.js'	
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
	grunt.registerTask('default', 'coffee:all test');
};