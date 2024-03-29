# createSwappableProxy

Creates a `Proxy` around any object. Retarget the proxy with `setTarget`.

## Installation

`yarn add @metamask/swappable-obj-proxy`

or

`npm install @metamask/swappable-obj-proxy`

## Usage

### createSwappableProxy

```js
const { createSwappableProxy } = require('@metamask/swappable-obj-proxy');

const original = { sayHello: () => 'hi' };
const next = { sayHello: () => 'haay' };
const proxy = createEventEmitterProxy(original);

proxy.sayHello(); //=> "hi"
proxy.setTarget(next);
proxy.sayHello(); //=> "haay"
```

### createEventEmitterProxy

Creates a `Proxy` around an `EventEmitter`. If the proxy has `setTarget` called with a different `EventEmitter`, all events will be removed from the old target and transferred to the new EventEmitter.

```js
const { createEventEmitterProxy } = require('@metamask/swappable-obj-proxy');

const original = new EventEmitter();
const next = new EventEmitter();
const proxy = createEventEmitterProxy(original);

proxy.on('event', () => console.log('saw event!'));

// triggers the event handler
original.emit('event');

// moves listeners over to next
proxy.setTarget(next);

// does NOT trigger the event handler
original.emit('event');
// DOES trigger the event handler
next.emit('event');
```
