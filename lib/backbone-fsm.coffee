do ->
	FSM = {}

	# Root is global in node and window in browser
	root = this
	
	if typeof module isnt 'undefined' and module.exports 
		module.exports = FSM
	else 
		root.FSM = FSM