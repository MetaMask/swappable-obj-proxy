### eventemitter-proxy

Creates a `Proxy` around an `EventEmitter`. If the proxy has `setTarget` called with a different `EventEmitter`, all events will be removed from the old target and transferred to the new EventEmitter.

##### usage
```js
const original = new EventEmitter()
const next = new EventEmitter()
const proxy = createEventEmitterProxy(original)

proxy.on('event', () => console.log('saw event!'))

// triggers the event handler
original.emit('event')

// moves listeners over to next
proxy.setTarget(next)

// does NOT trigger the event handler
original.emit('event')
// DOES trigger the event handler
next.emit('event')
```
