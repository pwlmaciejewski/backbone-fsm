
define(['../lib/backbone-fsm.js', 'qunit/qunit-1.10.0'], function(FSM) {
  return test("type", function() {
    equal(typeof FSM, 'object', 'FSM should be an object');
    return equal(typeof FSM.mixin, 'function', 'FSM should have a mixin method');
  });
});
