module.exports = function(grunt) {
	grunt.initConfig({
		test: {
			node: 'test/node.js'	
		},

		qunit: {
			amd: 'test/amd.html',
			browser: 'test/browser.html'
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
	grunt.registerTask('testall', 'test qunit:browser');
	grunt.registerTask('default', '');
};