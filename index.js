/**
 * Returns an EventEmitter that proxies events from the given event emitter
 * @param {any} eventEmitter
 * @param {object} listeners - The listeners to proxy to
 * @returns {any}
 */
module.exports = function createEventEmitterProxy (eventEmitter) {
  let target = eventEmitter
  const proxy = new Proxy({}, {
    get: (_, name) => {
      return target[name]
    },
    set: (_, name, value) => {
      target[name] = value
      return true
    },
  })
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
