
define(['../lib/backbone-fsm.js', 'qunit/qunit-1.10.0'], function(FSM) {
  return test("type", function() {
    return equal(typeof FSM, 'function', 'FSM should be a function');
  });
});
