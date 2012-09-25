FSM = require '../lib/backbone-fsm'
Backbone = require 'backbone'

module.exports =
	type: (test) ->
		test.equal typeof FSM, 'function', 'FSM should be an object'
		test.done()

	version: (test) ->
		test.equal FSM.version, require('../package.json').version, 'FSM version should be the same as the one in package.json'
		test.done()

	extend: (test) ->
		obj = 
			foo: 'bar'

		FSM obj

		test.equal typeof obj.state, 'function', 'FSM should extend obj with new method "state"'
		test.throws (->
			FSM()
		), null, 'FSM without arguments should throw an error'
		test.done()	

	stateless_model: (test) ->
		Model = Backbone.Model.extend
			initialize: ->
				FSM @

		model = new Model()
		test.equal model.state(), undefined, 'State of stateless model should be undefined'
		test.done()

	invalid_transition_definition: (test) ->
		Model = Backbone.Model.extend
			initialize: ->
				FSM @

			transitions:
				trans1:
					from: 'state1'

		test.throws (->
			model = new Model()
		), null, 'Invalid transition should throw an exception'
		test.done()

	states: (test) ->
		Model = Backbone.Model.extend
			initialize: ->
				FSM @

			transitions:
				rendering: 
					from: 'unrendered'
					to: 'ready'
				disabling:
					from: 'ready'
					to: 'more than ready'

		model = new Model()
		test.deepEqual model.states(), ['unrendered', 'ready', 'more than ready']
		test.done()

	default_state:	
		default: (test) ->
			Model = Backbone.Model.extend
				initialize: ->
					FSM @

				transitions:
					rendering: 
						from: 'unrendered'
						to: 'ready'
					disabling:
						from: 'ready'
						to: 'disabled'

			model = new Model()
			test.equal model.state(), 'unrendered', 'Default initial state should be the first source of the first transition'
			test.done()

		explicit: (test) ->
			Model = Backbone.Model.extend
				initialize: ->
					FSM @

				default_state: 'ready'

				transitions:
					rendering:
						from: 'unrendered'
						to: 'ready'

			model = new Model()
			test.equal model.state(), 'ready', 'FSM should respect default state set explicitly'
			test.done()

		invalid_state: (test) ->
			Model = Backbone.Model.extend
				initialize: ->
					FSM @
				
				default_state: 'foo'

				transitions:
					rendering:
						from: 'unrendered'
						to: 'ready'


			test.throws (->
				model = new Model()
			), null, 'State not defined in transitions table cannot be a default state'

			test.done()
