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

	FSM.version = '0.0.0'

	# Mixin function that takes one argument (an object)
	# and extends it with FSM methods and properties
	FSM.mixin = (that) ->
		if not that then throw new Error 'Mixin should be called with one argument (object to extend)'
		for name, val of FSM
			if name not in ['mixin', 'initialize', 'version'] then that[name] = val
		FSM.initialize.call that, that

	# Instance initialization method.
	# Creates all neccessary properties and
	# performs validation on input transitions table
	FSM.initialize = (options) ->
		# Some default properties
		this._state = options.default_state
		this._states = []
		this._currentTransition = null
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

	# Faccade for emiting events
	# This is because FSM needs to work with 
	# plain objects, not only with Backbone models/views
	FSM._tryToTrigger = (args...) ->
		if @trigger? then @trigger.apply(@, args)

	FSM.getCurrentTransition = ->
		return @_currentTransition

	FSM.setCurrentTransition = (name) ->
		@_currentTransition = @getTransition name

	FSM.resetCurrentTransition = ->
		@_currentTransition = null

	FSM.getTransition = (name) ->
		if name not of @transitions
			throw new Error "Invalid transition name '#{name}'"
		{
			name: name
			from: @transitions[name].from
			to: @transitions[name].to
		}

	FSM.getTransitionFromTo = (from, to) ->
		res = @getTransition(name) for name, transition of @transitions \
			when transition.from is from and transition.to is to
		if res then res else throw new Error "Can't find transition from '#{from}' to '#{to}'"

	FSM.startTransition = (name) ->
		if @getCurrentTransition() isnt null
			throw new Error "Cannot start new transtion when last one isn't finished"
		transition = @setCurrentTransition name
		@_tryToTrigger 'transition:start', transition

	FSM.stopTransition = ->
		transition = @getCurrentTransition()
		@resetCurrentTransition()
		@_tryToTrigger 'transition:stop', transition

	FSM.makeTransition = (name, callback = ->) ->
		@startTransition name
		fn = this['transition_' + name] ? (cb) -> cb()
		fn.call @, =>
			@stopTransition()
			callback()

	FSM.getState = ->
		this._state

	FSM.setState = (state, callback = ->) ->
		@makeTransition @getTransitionFromTo(@_state, state).name, =>
			@_state = state
			callback()
		
	FSM.getStates = ->
		this._states.slice()
