const createSwappableProxy = require('./createSwappableProxy')

module.exports = function createEventEmitterProxy (eventEmitter) {
  let target = eventEmitter
  const proxy = createSwappableProxy(eventEmitter)
  proxy.setTarget = function (newTarget) {
    const oldTarget = target
    target = newTarget
    // migrate listeners
    oldTarget.eventNames().forEach((name) => {
      getRawListeners(oldTarget, name).forEach(handler => newTarget.on(name, handler))
    })
    // remove old
    oldTarget.removeAllListeners()
  }

  return proxy
}

function getRawListeners(eventEmitter, name) {
  // prefer native
  if (eventEmitter.rawListeners) return eventEmitter.rawListeners(name)
  // fallback to lookup against internal object
  let events = eventEmitter._events[name] || []
  // ensure array
  if (!Array.isArray(events)) events = [events]
  // return copy
  return events.slice()
}
