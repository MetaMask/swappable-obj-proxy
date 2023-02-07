
module.exports = function createSwappableProxy (initialTarget) {
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
    target = newTarget
  }
}
