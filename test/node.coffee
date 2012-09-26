tests = require './tests'

tests.tests.version = (test) ->
	test.equal tests.FSM.version, require('../package.json').version, 'FSM.mixin version should be the same as the one in package.json'
	test.done()

module.exports = tests.tests