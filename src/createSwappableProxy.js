
module.exports = function createSwappableProxy (newTarget) {
  let target = newTarget
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
    target = newTarget
  }

  return proxy
}
