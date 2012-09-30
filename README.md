# Backbone-FSM

Finite-State Machine for Backbone views and models.
**Browser** and **Node.js** compatible.

## Installation

### Browser support

Include `lib/backbone-fsm.js` into your page.

### Node.js

```
npm install backbone-fsm
```

## Usage

### Initialization

`FSM` comes with `mixin` method. You have to extend `this` during initialization.

```javascript
var Foo = Backbone.View.extend({
	initialize: function () {
		FSM.mixin(this);
	}
});
```

### Transitions

You can define `transitions` and `defaultState`:

```javascript
var Foo = Backbone.View.extend({
	initialize: function () {
		FSM.mixin(this);
	},

	defaultState: 'firstState',

	transitions: {
		'transitionName': {
			from: 'firstState',
			to: 'secondState'
		}
	},

	onTransitionName: function (callback) {
		callback();
	}
});
``` 

To make a transition run `transitionTo("secondState")`.
During transition:

1. `transition:start` event is emited
2. `onTransitionName` callback is called (if defined).
3. `transition:stop` event is emited

## Example

Backbone-FSM live example:
[http://jsfiddle.net/fragphace/Zc6Gx/](http://jsfiddle.net/fragphace/Zc6Gx/)

## Tests [![Build Status](https://secure.travis-ci.org/fragphace/backbone-fsm.png?branch=master)](http://travis-ci.org/fragphace/backbone-fsm)

For server-side tests:

```
npm test
```

Browser tests can be found in `test/browser.html`. 
Tested under:

* IE 7+
* FF 15+
* Chrome 22+