define ['../lib/backbone-fsm.js', 'qunit/qunit-1.10.0'], (FSM) ->
	test "type", ->
		equal typeof FSM, 'object', 'FSM should be an object'
		equal typeof FSM.mixin, 'function', 'FSM should have a mixin method'