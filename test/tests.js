
(function() {
  var Backbone, FSM, tests;
  tests = {
    basic: {
      type: function(test) {
        test.equal(typeof FSM, 'object', 'FSM should be an object');
        return test.done();
      },
      mixin: function(test) {
        var obj;
        obj = {
          foo: 'bar'
        };
        FSM.mixin(obj);
        test.equal(typeof obj.setState, 'function', 'FSM.mixin should extend obj with new method "state"');
        test.equal(typeof obj.mixin, 'undefined', 'Mixin method should not be in obj');
        test.throws((function() {
          return FSM();
        }), null, 'FSM.mixin without arguments should throw an error');
        return test.done();
      },
      stateless: function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          }
        });
        model = new Model();
        test.equal(model.getState(), void 0, 'State of stateless model should be undefined');
        test.deepEqual(model.transitions, [], 'Transitions should be an empty array');
        return test.done();
      },
      tryToTrigger: {
        backboneModel: function(test) {
          var Model, model;
          Model = Backbone.Model.extend({
            initialize: function() {
              return FSM.mixin(this);
            }
          });
          model = new Model();
          model.on('foo', function() {
            test.ok(true);
            return test.done();
          });
          return model._tryToTrigger('foo');
        },
        plainObject: function(test) {
          var o;
          o = {};
          FSM.mixin(o);
          test.doesNotThrow(function() {
            return o._tryToTrigger('foo');
          });
          return test.done();
        }
      },
      getStates: function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            },
            disabling: {
              from: 'ready',
              to: 'more than ready'
            }
          }
        });
        model = new Model();
        test.deepEqual(model.getStates(), ['unrendered', 'ready', 'more than ready']);
        return test.done();
      }
    },
    transitionsTable: {
      invalid: function(test) {
        var Model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'state1'
            }
          }
        });
        test.throws((function() {
          var model;
          return model = new Model();
        }), null, 'Invalid transition should throw an exception');
        return test.done();
      },
      ambiguousTransitions: function(test) {
        var Model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'bar'
            }
          }
        });
        test.throws((function() {
          var model;
          return model = new Model();
        }), null, 'Ambiguous transition definition should throw an error');
        return test.done();
      }
    },
    currentTransition: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'baz'
            }
          }
        });
        this.model = new this.Model();
        return cb();
      },
      getCurrentTransition: function(test) {
        test.equal(this.model.getCurrentTransition(), null);
        return test.done();
      },
      setCurrentTransitionValid: function(test) {
        this.model.setCurrentTransition('trans1');
        test.equal(this.model.getCurrentTransition().name, 'trans1');
        return test.done();
      },
      setCurrentTransitionInvalidValue: function(test) {
        var _this = this;
        test.throws(function() {
          return _this.model.setCurrentTransition('xxx');
        });
        return test.done();
      },
      resetCurrentTransition: function(test) {
        this.model.setCurrentTransition('trans1');
        this.model.resetCurrentTransition();
        test.equal(this.model.getCurrentTransition(), null);
        return test.done();
      }
    },
    makeTransition: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'baz'
            }
          }
        });
        this.model = new this.Model();
        return cb();
      },
      startTransition: function(test) {
        this.model.on('transition:start', function(transition) {
          return test.equal(transition.name, 'trans1');
        });
        this.model.startTransition('trans1');
        test.equal(this.model.getCurrentTransition().name, 'trans1');
        test.expect(2);
        return test.done();
      },
      startInvalidTransition: function(test) {
        var _this = this;
        test.throws(function() {
          return model.startTransition('xxx');
        });
        test.throws(function() {
          return model.startTransition();
        });
        return test.done();
      },
      stopTransition: function(test) {
        this.model.on('transition:stop', function(transition) {
          return test.equal(transition.name, 'trans1');
        });
        this.model.startTransition('trans1');
        this.model.stopTransition();
        test.equal(this.model.getCurrentTransition(), null);
        test.expect(2);
        return test.done();
      },
      doubleStartTransition: function(test) {
        var _this = this;
        test.throws(function() {
          _this.model.startTransition('trans1');
          return _this.model.startTransition('trans2');
        });
        return test.done();
      },
      makeTransition: function(test) {
        var Model, model;
        Model = this.Model.extend({
          transition_trans1: function(cb) {
            test.ok(true);
            return cb();
          }
        });
        model = new Model();
        return model.makeTransition('trans1', function() {
          test.expect(1);
          return test.done();
        });
      }
    },
    transition: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            },
            trans2: {
              from: 'foo',
              to: 'baz'
            },
            trans3: {
              from: 'bar',
              to: 'baz'
            }
          }
        });
        this.model = new this.Model();
        return cb();
      },
      getTransition: function(test) {
        var transition;
        transition = this.model.getTransition('trans1');
        test.equal(transition.name, 'trans1');
        test.equal(transition.from, 'foo');
        test.equal(transition.to, 'bar');
        return test.done();
      },
      getInvalidTransition: function(test) {
        var _this = this;
        test.throws(function() {
          return _this.model.getTransition('xxx');
        });
        return test.done();
      },
      getTransitionFromToValid: function(test) {
        test.equal(this.model.getTransitionFromTo('bar', 'baz').name, 'trans3');
        return test.done();
      },
      getTransitionFromToInvalid: function(test) {
        test.throws(function() {
          return this.model.getTransitionFromTo('xxx', 'yyy');
        });
        test.throws(function() {
          return this.model.getTransitionFromTo('bar');
        });
        return test.done();
      }
    },
    defaultState: {
      "default": function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            },
            disabling: {
              from: 'ready',
              to: 'disabled'
            }
          }
        });
        model = new Model();
        test.equal(model.getState(), 'unrendered', 'Default initial state should be the first source of the first transition');
        return test.done();
      },
      explicit: function(test) {
        var Model, model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          default_state: 'ready',
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            }
          }
        });
        model = new Model();
        test.equal(model.getState(), 'ready', 'FSM.mixin should respect default state set explicitly');
        return test.done();
      },
      invalidState: function(test) {
        var Model;
        Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          default_state: 'foo',
          transitions: {
            rendering: {
              from: 'unrendered',
              to: 'ready'
            }
          }
        });
        test.throws((function() {
          var model;
          return model = new Model();
        }), null, 'State not defined in transitions table cannot be a default state');
        return test.done();
      }
    },
    stateChange: {
      setUp: function(cb) {
        this.Model = Backbone.Model.extend({
          initialize: function() {
            return FSM.mixin(this);
          },
          transitions: {
            trans1: {
              from: 'foo',
              to: 'bar'
            }
          }
        });
        return cb();
      },
      basic: function(test) {
        var model;
        model = new this.Model();
        return model.setState('bar', function() {
          test.equal(model.getState(), 'bar', 'State should be changed');
          return test.done();
        });
      },
      invalid: function(test) {
        var model;
        model = new this.Model();
        return model.setState('bar', function() {
          test.throws((function() {
            return model.setState('foo');
          }), null, 'Undefined transition should throw an error');
          return test.done();
        });
      }
    }
  };
  if (typeof module !== 'undefined' && module.exports) {
    exports.FSM = FSM = require('../lib/backbone-fsm');
    exports.Backbone = Backbone = require('backbone');
    return exports.tests = tests;
  } else {
    Backbone = window.Backbone;
    FSM = window.FSM;
    return window.tests = tests;
  }
})();
