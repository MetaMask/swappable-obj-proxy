module.exports = function createEventEmitterProxy (newTarget) {
  let target = newTarget

  const proxy = new Proxy({}, {
    get: (_, name) => {
      // override `setTarget` access
      if (name === 'setTarget') return setTarget
      return target[name]
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

   function setTarget(newTarget) {
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
