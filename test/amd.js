
define(['../lib/backbone-fsm.js', 'qunit/qunit-1.10.0'], function(FSM) {
  return test("type", function() {
    return equal(typeof FSM, 'object', 'FSM should be an object');
  });
});
