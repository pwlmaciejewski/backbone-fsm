/* 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
*/

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function() {
  var FSM;
  FSM = function(that) {
    var name, transition, _ref, _ref1, _ref2, _ref3;
    if (!that) {
      throw new Error('FSM should be called with one argument (object to extend)');
    }
    that._state = that.default_state;
    that.state = function() {
      return that._state;
    };
    that._states = [];
    that.states = function() {
      return that._states.slice();
    };
    _ref = that.transitions;
    for (name in _ref) {
      transition = _ref[name];
      if (!('from' in transition && 'to' in transition)) {
        throw Error("Transition '" + name + "' is not valid");
      }
      if (!that._state) {
        that._state = transition.from;
      }
      if (_ref1 = transition.from, __indexOf.call(that._states, _ref1) < 0) {
        that._states.push(transition.from);
      }
      if (_ref2 = transition.to, __indexOf.call(that._states, _ref2) < 0) {
        that._states.push(transition.to);
      }
    }
    if (that.default_state && (_ref3 = that.default_state, __indexOf.call(that._states, _ref3) < 0)) {
      throw new Error("Invalid default transition " + that.default_state + " - it's not defined in transitions table");
    }
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FSM;
  } else if (typeof define === 'function') {
    define(function() {
      return FSM;
    });
  } else {
    window.FSM = FSM;
  }
  return FSM.version = '0.0.0';
})();
