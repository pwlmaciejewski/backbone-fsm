### 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
###

do ->
	# Extend requires one argument (object to extend).
	# It extends it with FSM properties and methods.
	FSM = (that) ->
		if not that then throw new Error 'FSM should be called with one argument (object to extend)'

		# Actual state
		that._state = that.default_state
		that.state = (state, cb = ->) ->
			# When no state, we need to return current state
			if not state then return that._state

			# Validate state
			if state not in that._states then throw new Error "Invalid state '#{state}' "

			# Change state procedure
			that._state = state
			cb()

		# States
		that._states = []
		that.states = ->
			that._states.slice()

		# Get initial state
		for name, transition of that.transitions
			# Validate transition
			if not ('from' of transition and 'to' of transition)
				throw Error "Transition '#{name}' is not valid"  
			# Set default state
			if not that._state then that._state = transition.from
			# Add state to _states array
			if transition.from not in that._states then	that._states.push transition.from
			if transition.to not in that._states then that._states.push transition.to

		# Default state validation - it should 
		# be one of states defined in transitions table
		if that.default_state and that.default_state not in that._states
			throw new Error "Invalid default transition #{that.default_state} - it's not defined in transitions table"

	# Node
	if typeof module isnt 'undefined' and module.exports 
		module.exports = FSM
	# AMD
	else if typeof define is 'function'
		define ->
			FSM
	# Good ol'browser
	else 
		window.FSM = FSM

	# Version
	FSM.version = '0.0.0'
