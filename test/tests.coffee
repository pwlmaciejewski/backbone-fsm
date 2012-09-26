do ->
  tests =
    type: (test) ->
      test.equal typeof FSM, 'object', 'FSM should be an object'
      test.done()

    mixin: (test) ->
      obj = 
        foo: 'bar'

      FSM.mixin obj

      test.equal typeof obj.state, 'function', 'FSM.mixin should extend obj with new method "state"'
      test.equal typeof obj.mixin, 'undefined', 'Mixin method should not be in obj'
      test.throws (->
        FSM()
      ), null, 'FSM.mixin without arguments should throw an error'
      test.done() 

    stateless_model: (test) ->
      Model = Backbone.Model.extend
        initialize: ->
          FSM.mixin @

      model = new Model()
      test.equal model.state(), undefined, 'State of stateless model should be undefined'
      test.deepEqual model.transitions, [], 'Transitions should be an empty array'
      test.done()

    transitions:
      invalid: (test) ->
        Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @

          transitions:
            trans1:
              from: 'state1'

        test.throws (->
          model = new Model()
        ), null, 'Invalid transition should throw an exception'
        test.done()

      ambiguous_transitions: (test) ->
        Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @

          transitions:
            trans1:
              from: 'foo'
              to: 'bar'
            trans2: 
              from: 'foo'
              to: 'bar'

        test.throws (->
          model = new Model()
        ), null, 'Ambiguous transition definition should throw an error'
        test.done()
        

    states: (test) ->
      Model = Backbone.Model.extend
        initialize: ->
          FSM.mixin @

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
            FSM.mixin @

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
            FSM.mixin @

          default_state: 'ready'

          transitions:
            rendering:
              from: 'unrendered'
              to: 'ready'

        model = new Model()
        test.equal model.state(), 'ready', 'FSM.mixin should respect default state set explicitly'
        test.done()

      invalid_state: (test) ->
        Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @
          
          default_state: 'foo'

          transitions:
            rendering:
              from: 'unrendered'
              to: 'ready'

        test.throws (->
          model = new Model()
        ), null, 'State not defined in transitions table cannot be a default state'

        test.done()

    state_change:
      setUp: (cb) ->
        @Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @

          transitions:
            trans1:
              from: 'foo'
              to: 'bar'
        cb()

      basic: (test) ->
        model = new @Model()
        model.state 'bar', ->
          test.equal model.state(), 'bar', 'State should be changed'
          test.done()

      invalid: (test) ->
        model = new @Model()
        model.state 'bar', ->
          test.throws (->
            model.state 'foo'
          ), null, 'Undefined transition should throw an error'
          test.done();

      callback: (test) ->
        flag = false
        Model = @Model.extend
          transition_trans1: (cb) ->
            flag = true
            cb()

        model = new Model()
        model.state 'bar', ->
          test.equal flag, true, 'Foo_bar callback should be executed'
          test.done()

      transition: (test) ->
        Model = @Model.extend
          transition_trans1: (cb) ->
            test.equal @transition, 'trans1', 'Transition property should indicate current transition name'
            cb()

        model = new Model()
        test.equal model.transition, false, 'Transition property should be false when no transition is being made'

        model.state 'bar', ->
          test.done()

      events: (test) ->
        model = new @Model()
        model.on 'transition:start', (name) ->
          test.equal name, 'trans1'
        model.on 'transition:stop', (name) ->
          test.equal name, 'trans1'
        model.state 'bar', ->
          test.expect 2
          test.done()

      no_model_events: (test) ->
        obj = 
          transitions:
            tran1:
              from: 'foo'
              to: 'bar'

        FSM.mixin obj
        test.doesNotThrow (->
          obj.state 'bar'
        ), null, 'Object without trigger should be a ligitimate FSM object'
        test.done()

  # Export tests
  if typeof module isnt 'undefined' and module.exports 
    exports.FSM = FSM = require '../lib/backbone-fsm'
    exports.Backbone = Backbone = require 'backbone'
    exports.tests = tests
  else
    Backbone = window.Backbone
    FSM = window.FSM
    window.tests = tests