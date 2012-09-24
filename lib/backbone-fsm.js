/* 
Backbone-FSM v0.0.0
https://github.com/fragphace/backbone-fsm
*/

(function() {
  var FSM, root;
  FSM = {};
  root = this;
  if (typeof module !== 'undefined' && module.exports) {
    return module.exports = FSM;
  } else if (typeof define === 'function') {
    return define(function() {
      return FSM;
    });
  } else {
    return root.FSM = FSM;
  }
})();
