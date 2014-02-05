tests =
    basic:
        type: (test) ->
            test.equal typeof FSM, 'object', 'FSM should be an object'
            test.done()

        mixin: (test) ->
            obj = 
                foo: 'bar'

            FSM.mixin obj

            test.equal typeof obj.transitionTo, 'function', 'FSM.mixin should extend obj with new method "transitionTo"'
            test.equal typeof obj.mixin, 'undefined', 'Mixin method should not be in obj'
            test.throws (->
                FSM()
            ), null, 'FSM.mixin without arguments should throw an error'
            test.done() 

        tryToTrigger:
            backboneModel: (test) ->
                Model = Backbone.Model.extend
                    initialize: ->
                        FSM.mixin @

                model = new Model()
                model.on 'foo', ->
                    test.ok true
                    test.done()
                model._tryToTrigger 'foo'

            plainObject: (test) ->
                o = {}
                FSM.mixin o
                test.doesNotThrow ->
                    o._tryToTrigger 'foo'
                test.done()

    initialize: 
        returnValue: (test) ->
            o = Object.create(FSM).initialize()
            test.ok typeof o is 'object'
            test.done()

        innerState: (test) ->
            o = Object.create(FSM)
            o._resetAll()
            test.equal o._state, null
            test.deepEqual o._states, []
            test.equal o._currentTransition, null
            test.deepEqual o._transitions, {}
            test.done()

        stateless: (test) ->
            Model = Backbone.Model.extend
                initialize: ->
                    FSM.mixin @

            model = new Model()
            test.equal model.getCurrentState(), undefined, 'State of stateless model should be undefined'
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

    makeTransition:
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

        makeTransition: (test) ->
            Model = @Model.extend
                onTrans1: (cb) ->
                    test.ok(true)
                    cb()

            model = new Model()
            model.makeTransition 'trans1', ->
                test.expect 1
                test.done()
         
    currentState:
        setUp: (cb) ->
            @o = Object.create(FSM).initialize
                transitions: 
                    fooBar: 
                        from: 'foo'
                        to: 'bar'

            cb()

        setCurrentState: (test) ->        
            @o.setCurrentState 'bar'
            test.equal @o.getCurrentState(), 'bar'
            test.done()

        invalidSetSurrentState: (test) ->
            o = Object.create(FSM).initialize()
            test.throws ->
                o.setCurrentState 'foo'
            test.done()

        resetCurrentState: (test) ->
            @o.resetCurrentState()
            test.equal @o.getCurrentState(), null
            test.done()

    state:
        setUp: (cb) ->
            @o = Object.create(FSM).initialize
                transitions:
                    fooBar: 
                        from: 'foo'
                        to: 'bar'
            cb()

        getStates: (test) ->
            test.deepEqual @o.getStates(), ['foo', 'bar']
            test.done()

        addState: (test) ->
            @o.addState 'baz'
            @o.addState 'foo'
            test.deepEqual @o.getStates(), ['foo', 'bar', 'baz']
            test.done()

        addStates: (test) ->
            @o.addStates 'baz', 'foo'
            test.deepEqual @o.getStates(), ['foo', 'bar', 'baz']
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
            test.equal @model.getTransitionFromTo('xxx', 'yyy'), null
            test.equal @model.getTransitionFromTo('bar'), null
            test.done()

        _addTransitionObject: (test) ->
            o = Object.create(FSM).initialize()
            o._addTransitionObject
                name: 'xxxYyy'
                from: 'xxx'
                to: 'yyy'
        
            test.equal o.getTransition('xxxYyy').from, 'xxx'
            test.deepEqual o.getStates(), ['xxx', 'yyy']
            test.done();

        _createTransitionObject: (test) ->
            t = FSM._createTransitionObject 'fooBar', 'foo', 'bar'
            test.deepEqual t, 
                name: 'fooBar'
                from: 'foo'
                to: 'bar'
            test.done()

    isValidTransition: 
        valid: (test) ->
            test.ok not FSM.isValidTransition
                name: 'fooBar'
                from: 'foo'
                to: 'bar'
            test.done()

        invalid: (test) ->
            test.equal "Transition 'fooBar' is not valid", FSM.isValidTransition
                name: 'fooBar'
                from: 'foo'
            test.done()

        ambiguous: (test) ->
            o = Object.create(FSM).initialize
                transitions:
                    fooBar:
                        from: 'foo'
                        to: 'bar'

            test.equal "Ambiguous transition 'fooBar2'", o.isValidTransition
                name: 'fooBar2'
                from: 'foo'
                to: 'bar' 
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
            test.equal model.getCurrentState(), 'unrendered'
            test.done()

        explicit: (test) ->
            Model = Backbone.Model.extend
                initialize: ->
                    FSM.mixin @

                defaultState: 'ready'

                transitions:
                    rendering:
                        from: 'unrendered'
                        to: 'ready'

            model = new Model()
            test.equal model.getCurrentState(), 'ready', 'FSM.mixin should respect default state set explicitly'
            test.done()

        invalidState: (test) ->
            Model = Backbone.Model.extend
                initialize: ->
                    FSM.mixin @
                
                defaultState: 'foo'

                transitions:
                    rendering:
                        from: 'unrendered'
                        to: 'ready'

            test.throws ->
                model = new Model()        

            test.done()

    transitionTo:
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
            model.transitionTo 'bar', ->
                test.equal model.getCurrentState(), 'bar', 'State should be changed'
                test.done()

        invalid: (test) ->
            model = new @Model()
            model.transitionTo 'bar', ->
                test.throws (->
                    model.transitionTo 'foo'
                ), null, 'Undefined transition should throw an error'
                test.done();

# Export tests
if typeof module isnt 'undefined' and module.exports 
    exports.FSM = FSM = require '../lib/backbone-fsm'
    exports.Backbone = Backbone = require 'backbone'
    exports.tests = tests
else
    Backbone = window.Backbone
    FSM = window.FSM
    window.tests = tests