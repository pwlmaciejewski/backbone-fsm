define ['../lib/backbone-fsm.js', 'qunit/qunit-1.10.0'], (FSM) ->
	test "type", ->
		equal typeof FSM, 'function', 'FSM should be a function'