
test("type", function() {
  equal(typeof FSM, 'object', 'FSM should be an object');
  return equal(typeof FSM.mixin, 'function', 'FSM should have a mixin method');
});
