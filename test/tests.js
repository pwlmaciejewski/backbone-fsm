
(function() {
  var Backbone, FSM, tests;
  tests = {
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
      test.equal(typeof obj.state, 'function', 'FSM.mixin should extend obj with new method "state"');
      test.equal(typeof obj.mixin, 'undefined', 'Mixin method should not be in obj');
      test.throws((function() {
        return FSM();
      }), null, 'FSM.mixin without arguments should throw an error');
      return test.done();
    },
    stateless_model: function(test) {
      var Model, model;
      Model = Backbone.Model.extend({
        initialize: function() {
          return FSM.mixin(this);
        }
      });
      model = new Model();
      test.equal(model.state(), void 0, 'State of stateless model should be undefined');
      test.deepEqual(model.transitions, [], 'Transitions should be an empty array');
      return test.done();
    },
    transitions: {
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
      ambiguous_transitions: function(test) {
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
    states: function(test) {
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
      test.deepEqual(model.states(), ['unrendered', 'ready', 'more than ready']);
      return test.done();
    },
    default_state: {
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
        test.equal(model.state(), 'unrendered', 'Default initial state should be the first source of the first transition');
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
        test.equal(model.state(), 'ready', 'FSM.mixin should respect default state set explicitly');
        return test.done();
      },
      invalid_state: function(test) {
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
    state_change: {
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
        return model.state('bar', function() {
          test.equal(model.state(), 'bar', 'State should be changed');
          return test.done();
        });
      },
      invalid: function(test) {
        var model;
        model = new this.Model();
        return model.state('bar', function() {
          test.throws((function() {
            return model.state('foo');
          }), null, 'Undefined transition should throw an error');
          return test.done();
        });
      },
      callback: function(test) {
        var Model, flag, model;
        flag = false;
        Model = this.Model.extend({
          transition_trans1: function(cb) {
            flag = true;
            return cb();
          }
        });
        model = new Model();
        return model.state('bar', function() {
          test.equal(flag, true, 'Foo_bar callback should be executed');
          return test.done();
        });
      },
      transition: function(test) {
        var Model, model;
        Model = this.Model.extend({
          transition_trans1: function(cb) {
            test.equal(this.transition, 'trans1', 'Transition property should indicate current transition name');
            return cb();
          }
        });
        model = new Model();
        test.equal(model.transition, false, 'Transition property should be false when no transition is being made');
        return model.state('bar', function() {
          return test.done();
        });
      },
      events: function(test) {
        var model;
        model = new this.Model();
        model.on('transition:start', function(name) {
          return test.equal(name, 'trans1');
        });
        model.on('transition:stop', function(name) {
          return test.equal(name, 'trans1');
        });
        return model.state('bar', function() {
          test.expect(2);
          return test.done();
        });
      },
      no_model_events: function(test) {
        var obj;
        obj = {
          transitions: {
            tran1: {
              from: 'foo',
              to: 'bar'
            }
          }
        };
        FSM.mixin(obj);
        test.doesNotThrow((function() {
          return obj.state('bar');
        }), null, 'Object without trigger should be a ligitimate FSM object');
        return test.done();
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
