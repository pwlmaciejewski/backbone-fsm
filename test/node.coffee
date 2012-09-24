FSM = require '../lib/backbone-fsm'
Backbone = require 'backbone'

module.exports =
	type: (test) ->
		test.equal typeof FSM, 'object', 'FSM should be an object'
		test.done()