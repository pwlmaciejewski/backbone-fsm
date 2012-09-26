### 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
###

do ->	
	FSM = {}	

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

	# Mixin function that takes one argument (an object)
	# and extends it with FSM methods and properties
	FSM.mixin = (that) ->
		if not that then throw new Error 'Mixin should be called with one argument (object to extend)'

		# Blacklist - fields which will be excluded from mixing
		blacklist = ['mixin', 'initialize', 'version']

		# Now our job is to augment that with FSM methods
		# and initialize it (with FSM.initialize)
		for name, val of FSM
			if name not in blacklist then that[name] = val

		FSM.initialize.call that, that

	# Instance initialization method.
	# Creates all neccessary properties and
	# performs validation on input transitions table
	FSM.initialize = (options) ->
		# Some default properties
		this._state = options.default_state
		this._states = []
		this.transition = false
		if not options.transitions then this.transitions = []

		# Get initial state
		for name, transition of this.transitions
			# Validate transition (it should always contain from and to)
			if not transition.from? or not transition.to?
				throw Error "Transition '#{name}' is not valid"  
			
			# Check transitions uniqueness
			sameTransitions = 
				t for n, t of this.transitions \
				when t.from is transition.from \
				and t.to is transition.to
			if sameTransitions.length isnt 1 
				throw new Error "Ambiguous transition '#{name}'"
			
			# Set default state
			if not this._state then this._state = transition.from
			
			# Add state to _states array
			if transition.from not in this._states
				this._states.push transition.from
			if transition.to not in this._states 
				this._states.push transition.to

		# Default state validation - it should 
		# be one of states defined in transitions table
		if this.default_state and this.default_state not in this._states
			throw new Error "Invalid default transition #{that.default_state} - it's not defined in transitions table"

	# Get/Set state method.
	# Without arguments it returns current state.
	# First argument is destination state (it must be valid).
	# Second argument is an optional callback.
	FSM.state = (state, callback = ->) ->
		oldState = this._state
		newState = state

		# When no state, we need to return current state
		if not state then return oldState

		# Get transition
		name = n for n, t of this.transitions \
			when t.from is oldState and t.to is newState
		if not name
			throw new Error "Invalid transition from '#{oldState}' to '#{newState}'"

		# Set transition property
		this.transition = name

		# Transition:start event
		if this.trigger? then this.trigger 'transition:start', name

		# Change state procedure
		transitionMethod = this['transition_' + name] ? (cb) -> cb()
		transitionMethod.call this, =>
			# Things back to normal
			this._state = state
			this.transition = false
			if this.trigger? then this.trigger 'transition:stop', name
			callback()
		
	# Convienience method. Returns 
	# a copy of the internal states array
	FSM.states = ->
		this._states.slice()
