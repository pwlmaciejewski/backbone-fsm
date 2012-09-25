var Backbone, FSM;

FSM = require('../lib/backbone-fsm');

Backbone = require('backbone');

module.exports = {
  type: function(test) {
    test.equal(typeof FSM, 'function', 'FSM should be an object');
    return test.done();
  },
  version: function(test) {
    test.equal(FSM.version, require('../package.json').version, 'FSM version should be the same as the one in package.json');
    return test.done();
  },
  extend: function(test) {
    var obj;
    obj = {
      foo: 'bar'
    };
    FSM(obj);
    test.equal(typeof obj.state, 'function', 'FSM should extend obj with new method "state"');
    test.throws((function() {
      return FSM();
    }), null, 'FSM without arguments should throw an error');
    return test.done();
  },
  stateless_model: function(test) {
    var Model, model;
    Model = Backbone.Model.extend({
      initialize: function() {
        return FSM(this);
      }
    });
    model = new Model();
    test.equal(model.state(), void 0, 'State of stateless model should be undefined');
    return test.done();
  },
  invalid_transition_definition: function(test) {
    var Model;
    Model = Backbone.Model.extend({
      initialize: function() {
        return FSM(this);
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
  states: function(test) {
    var Model, model;
    Model = Backbone.Model.extend({
      initialize: function() {
        return FSM(this);
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
          return FSM(this);
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
          return FSM(this);
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
      test.equal(model.state(), 'ready', 'FSM should respect default state set explicitly');
      return test.done();
    },
    invalid_state: function(test) {
      var Model;
      Model = Backbone.Model.extend({
        initialize: function() {
          return FSM(this);
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
          return FSM(this);
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
      test.throws((function() {
        return model.state('xxx');
      }), null, 'Invalid state should throw an error');
      return test.done();
    }
  }
};
