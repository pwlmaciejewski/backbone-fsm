/* 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
*/

var __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  FSM._resetAll = function() {
    this._states = [];
    this._transitions = {};
    this.resetCurrentState();
    return this.resetCurrentTransition();
  };
  FSM.initialize = function(options) {
    var name, trans, _ref;
    if (options == null) {
      options = {};
    }
    this._resetAll();
    _ref = options.transitions;
    for (name in _ref) {
      trans = _ref[name];
      this.addTransition(name, trans.from, trans.to);
    }
    if (this.getStates().length) {
      this.setCurrentState(this.getStates()[0]);
    }
    if (options.defaultState != null) {
      this.setCurrentState(options.defaultState);
    }
    return this;
  };
  FSM._tryToTrigger = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.trigger != null) {
      return this.trigger.apply(this, args);
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
    if (!(name in this._transitions)) {
      throw new Error("Invalid transition name '" + name + "'");
    }
    return this._createTransitionObject(name, this._transitions[name].from, this._transitions[name].to);
  };
  FSM.getTransitionFromTo = function(from, to) {
    var name, res, transition, _ref;
    _ref = this._transitions;
    for (name in _ref) {
      transition = _ref[name];
      if (transition.from === from && transition.to === to) {
        res = this.getTransition(name);
      }
    }
    if (res) {
      return res;
    } else {
      return null;
    }
  };
  FSM.addTransition = function(name, from, to) {
    var error, t;
    t = this._createTransitionObject(name, from, to);
    error = this.isValidTransition(t);
    if (error) {
      throw new Error(error);
    }
    return this._addTransitionObject(t);
  };
  FSM._createTransitionObject = function(name, from, to) {
    return {
      name: name,
      from: from,
      to: to
    };
  };
  FSM._addTransitionObject = function(t) {
    this._transitions[t.name] = {
      from: t.from,
      to: t.to
    };
    return this.addStates(t.from, t.to);
  };
  FSM.isValidTransition = function(t) {
    if (!this._isValidTransitionObject(t)) {
      return "Transition '" + t.name + "' is not valid";
    }
    if (this.getTransitionFromTo(t.from, t.to)) {
      return "Ambiguous transition '" + t.name + "'";
    }
    return false;
  };
  FSM._isValidTransitionObject = function(t) {
    if (typeof t.name === 'string' && typeof t.from === 'string' && typeof t.to === 'string') {
      return true;
    }
    return false;
  };
  FSM.startTransition = function(name) {
    var transition;
    if (this.getCurrentTransition() !== null) {
      throw new Error("Cannot start new transtion when last one isn't finished");
    }
    transition = this.setCurrentTransition(name);
    return this._tryToTrigger('transition:start', transition);
  };
  FSM.stopTransition = function() {
    var transition;
    transition = this.getCurrentTransition();
    this.resetCurrentTransition();
    return this._tryToTrigger('transition:stop', transition);
  };
  FSM.makeTransition = function(name, callback) {
    var fn, _ref,
      _this = this;
    if (callback == null) {
      callback = function() {};
    }
    this.startTransition(name);
    fn = (_ref = this['transition_' + name]) != null ? _ref : function(cb) {
      return cb();
    };
    return fn.call(this, function() {
      _this.stopTransition();
      return callback();
    });
  };
  FSM.getCurrentState = function() {
    return this._currentState;
  };
  FSM.setCurrentState = function(state) {
    if (__indexOf.call(this._states, state) < 0) {
      throw new Error("Invalid state '" + state + "'");
    }
    return this._currentState = state;
  };
  FSM.resetCurrentState = function() {
    return this._currentState = null;
  };
  FSM.transitionTo = function(state, callback) {
    var _this = this;
    if (callback == null) {
      callback = function() {};
    }
    return this.makeTransition(this.getTransitionFromTo(this._currentState, state).name, function() {
      _this._currentState = state;
      return callback();
    });
  };
  FSM.addState = function(state) {
    if (__indexOf.call(this._states, state) < 0) {
      return this._states.push(state);
    }
  };
  FSM.addStates = function() {
    var state, states, _i, _len, _results;
    states = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = states.length; _i < _len; _i++) {
      state = states[_i];
      _results.push(this.addState(state));
    }
    return _results;
  };
  return FSM.getStates = function() {
    return this._states.slice();
  };
})();
