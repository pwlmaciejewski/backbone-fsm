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
    var blacklist, name, val;
    if (!that) {
      throw new Error('Mixin should be called with one argument (object to extend)');
    }
    blacklist = ['mixin', 'initialize', 'version'];
    for (name in FSM) {
      val = FSM[name];
      if (__indexOf.call(blacklist, name) < 0) {
        that[name] = val;
      }
    }
    return FSM.initialize.call(that, that);
  };
  FSM.initialize = function(options) {
    var n, name, sameTransitions, t, transition, _ref, _ref1, _ref2, _ref3;
    this._state = options.default_state;
    this._states = [];
    this.transition = false;
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
  FSM.state = function(state, callback) {
    var n, name, newState, oldState, t, transitionMethod, _ref, _ref1,
      _this = this;
    if (callback == null) {
      callback = function() {};
    }
    oldState = this._state;
    newState = state;
    if (!state) {
      return oldState;
    }
    _ref = this.transitions;
    for (n in _ref) {
      t = _ref[n];
      if (t.from === oldState && t.to === newState) {
        name = n;
      }
    }
    if (!name) {
      throw new Error("Invalid transition from '" + oldState + "' to '" + newState + "'");
    }
    this.transition = name;
    if (this.trigger != null) {
      this.trigger('transition:start', name);
    }
    transitionMethod = (_ref1 = this['transition_' + name]) != null ? _ref1 : function(cb) {
      return cb();
    };
    return transitionMethod.call(this, function() {
      _this._state = state;
      _this.transition = false;
      if (_this.trigger != null) {
        _this.trigger('transition:stop', name);
      }
      return callback();
    });
  };
  return FSM.states = function() {
    return this._states.slice();
  };
})();
