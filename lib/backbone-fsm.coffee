### 
Backbone-FSM v0.0.1
https://github.com/fragphace/backbone-fsm
###

do ->	
	FSM = {}	
	if typeof module isnt 'undefined' and module.exports 
		module.exports = FSM
	else if typeof define is 'function'
		define ->
			FSM
	else 
		window.FSM = FSM

	FSM.version = '0.0.1'

	FSM.mixin = (that) ->
		if not that then throw new Error 'Mixin should be called with one argument (object to extend)'
		for name, val of FSM
			if name not in ['mixin', 'initialize', 'version'] then that[name] = val
		FSM.initialize.call that, that

	FSM._resetAll = ->
		@_states = []
		@_transitions = {}
		@resetCurrentState()
		@resetCurrentTransition()

	FSM.initialize = (options = {}) ->
		@_resetAll()		
		@addTransition(name, trans.from, trans.to) for name, trans of options.transitions
		if @getStates().length then @setCurrentState @getStates()[0]
		if options.defaultState? then @setCurrentState options.defaultState
		@

	FSM._tryToTrigger = (args...) ->
		if @trigger? then @trigger.apply(@, args)

	FSM.getCurrentTransition = ->
		return @_currentTransition

	FSM.setCurrentTransition = (name) ->
		@_currentTransition = @getTransition name

	FSM.resetCurrentTransition = ->
		@_currentTransition = null

	FSM.getTransition = (name) ->
		if name not of @_transitions
			throw new Error "Invalid transition name '#{name}'"
		@_createTransitionObject name, @_transitions[name].from, @_transitions[name].to

	FSM.getTransitionFromTo = (from, to) ->
		res = @getTransition(name) for name, transition of @_transitions \
			when transition.from is from and transition.to is to
		if res then res else null

	FSM.addTransition = (name, from, to) ->
		t = @_createTransitionObject name, from, to
		error = @isValidTransition t
		if error then throw new Error error
		@_addTransitionObject t

	FSM._createTransitionObject = (name, from, to) ->
		name: name
		from: from
		to: to

	FSM._addTransitionObject = (t) ->
		@_transitions[t.name] = 
			from: t.from
			to: t.to
		@addStates t.from, t.to

	FSM.isValidTransition = (t) ->
		if not @_isValidTransitionObject(t) then return "Transition '#{t.name}' is not valid"
		if @getTransitionFromTo(t.from, t.to) then return "Ambiguous transition '#{t.name}'"
		false

	FSM._isValidTransitionObject = (t) ->
		if typeof t.name is 'string' and typeof t.from is 'string' and typeof t.to is 'string'
			return true
		false

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
		fn = this['on' + name.charAt(0).toUpperCase() + name.slice(1)] ? (cb) -> cb()
		fn.call @, =>
			@stopTransition()
			callback()

	FSM.getCurrentState = ->
		@_currentState

	FSM.setCurrentState = (state) ->
		if state not in @_states
			throw new Error "Invalid state '#{state}'"
		@_currentState = state

	FSM.resetCurrentState = ->
		@_currentState = null

	FSM.transitionTo = (state, callback = ->) ->
		@makeTransition @getTransitionFromTo(@_currentState, state).name, =>
			@_currentState = state
			callback()
		
	FSM.addState = (state) ->
		if state not in @_states then @_states.push state

	FSM.addStates = (states...) ->
		for state in states
			@addState state

	FSM.getStates = ->
		this._states.slice()
