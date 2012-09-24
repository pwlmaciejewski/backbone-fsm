var Backbone, FSM;

FSM = require('../lib/backbone-fsm');

Backbone = require('backbone');

module.exports = {
  type: function(test) {
    test.equal(typeof FSM, 'object', 'FSM should be an object');
    return test.done();
  }
};
