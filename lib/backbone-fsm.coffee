### 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
###

do ->
	FSM = {}

	# Reference to the global object	
	root = this
	
	# Node
	if typeof module isnt 'undefined' and module.exports 
		module.exports = FSM
	# AMD
	else if typeof define is 'function'
		define ->
			FSM
	# Good ol'browser
	else 
		root.FSM = FSM