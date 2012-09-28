do ->
  tests =
    basic:
      type: (test) ->
        test.equal typeof FSM, 'object', 'FSM should be an object'
        test.done()

      mixin: (test) ->
        obj = 
          foo: 'bar'

        FSM.mixin obj

        test.equal typeof obj.setState, 'function', 'FSM.mixin should extend obj with new method "state"'
        test.equal typeof obj.mixin, 'undefined', 'Mixin method should not be in obj'
        test.throws (->
          FSM()
        ), null, 'FSM.mixin without arguments should throw an error'
        test.done() 

      stateless: (test) ->
        Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @

        model = new Model()
        test.equal model.getState(), undefined, 'State of stateless model should be undefined'
        test.deepEqual model.transitions, [], 'Transitions should be an empty array'
        test.done()

      getStates: (test) ->
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
        test.deepEqual model.getStates(), ['unrendered', 'ready', 'more than ready']
        test.done()

    transitionsTable:
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

      ambiguousTransitions: (test) ->
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

    currentTransition:
      setUp: (cb) ->
        @Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @

          transitions:
            trans1:
              from: 'foo'
              to: 'bar'
            trans2:
              from: 'foo'
              to: 'baz'

        @model = new @Model()
        cb()

      getCurrentTransition: (test) ->
        test.equal @model.getCurrentTransition(), null
        test.done()

      setCurrentTransitionValid: (test) ->
        @model.setCurrentTransition 'trans1'
        test.equal @model.getCurrentTransition().name, 'trans1'
        test.done()

      setCurrentTransitionInvalidValue: (test) ->
        test.throws =>
          @model.setCurrentTransition 'xxx'
        test.done()

      resetCurrentTransition: (test) ->
        @model.setCurrentTransition 'trans1'
        @model.resetCurrentTransition()
        test.equal @model.getCurrentTransition(), null
        test.done()

      startTransition: (test) ->
        @model.on 'transition:start', (transition) ->
          test.equal transition.name, 'trans1'
        @model.startTransition 'trans1'

        test.equal @model.getCurrentTransition().name, 'trans1'
        test.expect 2
        test.done()

      startInvalidTransition: (test) ->
        test.throws =>
          model.startTransition 'xxx'
        test.throws =>
          model.startTransition()
        test.done()

      stopTransition: (test) ->
        @model.on 'transition:stop', (transition) ->
          test.equal transition.name, 'trans1'
        @model.startTransition 'trans1'
        @model.stopTransition()

        test.equal @model.getCurrentTransition(), null
        test.expect 2
        test.done()

      doubleStartTransition: (test) ->
        test.throws =>
          @model.startTransition 'trans1'
          @model.startTransition 'trans2'
        test.done()

    transition:
      setUp: (cb) ->
        @Model = Backbone.Model.extend
          initialize: ->
            FSM.mixin @

          transitions:
            trans1:
              from: 'foo'
              to: 'bar'
            trans2:
              from: 'foo'
              to: 'baz'
            trans3:
              from: 'bar'
              to: 'baz'

        @model = new @Model()
        cb()

      getTransition: (test) ->
        transition = @model.getTransition 'trans1'
        test.equal transition.name, 'trans1'
        test.equal transition.from, 'foo'
        test.equal transition.to, 'bar'
        test.done()

      getInvalidTransition: (test) ->
        test.throws =>
          @model.getTransition 'xxx'
        test.done()

      getTransitionFromToValid: (test) ->
        test.equal @model.getTransitionFromTo('bar', 'baz').name, 'trans3'
        test.done()

      getTransitionFromToInvalid: (test) ->
        test.throws ->
          @model.getTransitionFromTo('xxx', 'yyy')
        test.throws ->
          @model.getTransitionFromTo('bar')
        test.done()

    defaultState:  
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
        test.equal model.getState(), 'unrendered', 'Default initial state should be the first source of the first transition'
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
        test.equal model.getState(), 'ready', 'FSM.mixin should respect default state set explicitly'
        test.done()

      invalidState: (test) ->
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

    stateChange:
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
        model.setState 'bar', ->
          test.equal model.getState(), 'bar', 'State should be changed'
          test.done()

      invalid: (test) ->
        model = new @Model()
        model.setState 'bar', ->
          test.throws (->
            model.setState 'foo'
          ), null, 'Undefined transition should throw an error'
          test.done();

      callback: (test) ->
        flag = false
        Model = @Model.extend
          transition_trans1: (cb) ->
            flag = true
            cb()

        model = new Model()
        model.setState 'bar', ->
          test.equal flag, true, 'Foo_bar callback should be executed'
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