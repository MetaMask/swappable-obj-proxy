
module.exports = function createSwappableProxy (newTarget) {
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
    target = newTarget
  }

  return proxy
}
