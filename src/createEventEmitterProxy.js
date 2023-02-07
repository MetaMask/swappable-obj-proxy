const filterNoop = () => true
const internalEvents = ['newListener', 'removeListener']
const externalEventFilter = (name) => !internalEvents.includes(name)

module.exports = function createEventEmitterProxy (initialTarget, opts) {
  // parse options
  opts = opts || {}
  let eventFilter = opts.eventFilter || filterNoop
  if (eventFilter === 'skipInternal') eventFilter = externalEventFilter
  if (typeof eventFilter !== 'function') throw new Error('createEventEmitterProxy - Invalid eventFilter')

  let target = initialTarget

  const proxy = new Proxy({}, {
    get: (_, name, receiver) => {
      // override `setTarget` access
      if (name === 'setTarget') return setTarget

      const value = target[name];
      if (value instanceof Function) {
        return function (...args) {
          return value.apply(this === receiver ? target : this, args);
        };
      }
      return value;
    },
    set: (_, name, value) => {
      // allow `setTarget` overrides
      if (name === 'setTarget') {
        setTarget = value
        return true
      }
      target[name] = value
      return true
    },
  })

  return proxy

  function setTarget(newTarget) {
    const oldTarget = target
    target = newTarget
    // migrate listeners
    oldTarget.eventNames().filter(eventFilter).forEach((name) => {
      getRawListeners(oldTarget, name).forEach(handler => newTarget.on(name, handler))
    })
    // remove old
    oldTarget.removeAllListeners()
  }
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
