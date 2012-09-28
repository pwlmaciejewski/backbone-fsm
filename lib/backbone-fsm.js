/* 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
*/

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function() {
  var FSM;
  FSM = {};
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FSM;
  } else if (typeof define === 'function') {
    define(function() {
      return FSM;
    });
  } else {
    window.FSM = FSM;
  }
  FSM.version = '0.0.0';
  FSM.mixin = function(that) {
    var name, val;
    if (!that) {
      throw new Error('Mixin should be called with one argument (object to extend)');
    }
    for (name in FSM) {
      val = FSM[name];
      if (name !== 'mixin' && name !== 'initialize' && name !== 'version') {
        that[name] = val;
      }
    }
    return FSM.initialize.call(that, that);
  };
  FSM.initialize = function(options) {
    var n, name, sameTransitions, t, transition, _ref, _ref1, _ref2, _ref3;
    this._state = options.default_state;
    this._states = [];
    this._currentTransition = null;
    if (!options.transitions) {
      this.transitions = [];
    }
    _ref = this.transitions;
    for (name in _ref) {
      transition = _ref[name];
      if (!(transition.from != null) || !(transition.to != null)) {
        throw Error("Transition '" + name + "' is not valid");
      }
      sameTransitions = (function() {
        var _ref1, _results;
        _ref1 = this.transitions;
        _results = [];
        for (n in _ref1) {
          t = _ref1[n];
          if (t.from === transition.from && t.to === transition.to) {
            _results.push(t);
          }
        }
        return _results;
      }).call(this);
      if (sameTransitions.length !== 1) {
        throw new Error("Ambiguous transition '" + name + "'");
      }
      if (!this._state) {
        this._state = transition.from;
      }
      if (_ref1 = transition.from, __indexOf.call(this._states, _ref1) < 0) {
        this._states.push(transition.from);
      }
      if (_ref2 = transition.to, __indexOf.call(this._states, _ref2) < 0) {
        this._states.push(transition.to);
      }
    }
    if (this.default_state && (_ref3 = this.default_state, __indexOf.call(this._states, _ref3) < 0)) {
      throw new Error("Invalid default transition " + that.default_state + " - it's not defined in transitions table");
    }
  };
  FSM.getCurrentTransition = function() {
    return this._currentTransition;
  };
  FSM.setCurrentTransition = function(name) {
    return this._currentTransition = this.getTransition(name);
  };
  FSM.resetCurrentTransition = function() {
    return this._currentTransition = null;
  };
  FSM.getTransition = function(name) {
    if (!(name in this.transitions)) {
      throw new Error("Invalid transition name '" + name + "'");
    }
    return {
      name: name,
      from: this.transitions[name].from,
      to: this.transitions[name].to
    };
  };
  FSM.getTransitionFromTo = function(from, to) {
    var name, res, transition, _ref;
    _ref = this.transitions;
    for (name in _ref) {
      transition = _ref[name];
      if (transition.from === from && transition.to === to) {
        res = this.getTransition(name);
      }
    }
    if (res) {
      return res;
    } else {
      throw new Error("Can't find transition from '" + from + "' to '" + to + "'");
    }
  };
  FSM.startTransition = function(name) {
    var transition;
    if (this.getCurrentTransition() !== null) {
      throw new Error("Cannot start new transtion when last one isn't finished");
    }
    transition = this.setCurrentTransition(name);
    if (this.trigger != null) {
      return this.trigger('transition:start', transition);
    }
  };
  FSM.stopTransition = function() {
    var transition;
    transition = this.getCurrentTransition();
    this.resetCurrentTransition();
    if (this.trigger != null) {
      return this.trigger('transition:stop', transition);
    }
  };
  FSM.getState = function() {
    return this._state;
  };
  FSM.setState = function(state, callback) {
    var newState, oldState, transition, transitionMethod, _ref,
      _this = this;
    if (callback == null) {
      callback = function() {};
    }
    oldState = this._state;
    newState = state;
    transition = this.getTransitionFromTo(oldState, newState);
    this.startTransition(transition.name);
    transitionMethod = (_ref = this['transition_' + transition.name]) != null ? _ref : function(cb) {
      return cb();
    };
    return transitionMethod.call(this, function() {
      _this._state = newState;
      _this.stopTransition();
      return callback();
    });
  };
  return FSM.getStates = function() {
    return this._states.slice();
  };
})();
