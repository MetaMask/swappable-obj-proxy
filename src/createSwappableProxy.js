/**
 * Represents the proxy object, which wraps a target object. As a result, it
 * allows for accessing and setting all of the properties that the target object
 * supports, but also supports an extra method to switch the target.
 *
 * @typedef SwappableProxy
 * @property {(newTarget: any) => void} setTarget - Allows for switching the
 * target.
 */

/**
 * Creates a proxy object that initially points to the given object but whose
 * target can be substituted with another object later using its `setTarget`
 * method.
 *
 * @param {any} initialTarget - The initial object you want to wrap.
 * @returns {SwappableProxy} The proxy object.
 */
function createSwappableProxy(initialTarget) {
  let target = initialTarget;

  /**
   * Changes the object that the proxy wraps.
   *
   * @param {any} newTarget - The new object.
   */
  let setTarget = (newTarget) => {
    target = newTarget;
  };

  const proxy = new Proxy(
    {},
    {
      get: (_, name, receiver) => {
        // override `setTarget` access
        if (name === 'setTarget') {
          return setTarget;
        }

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
          setTarget = value;
          return true;
        }
        target[name] = value;
        return true;
      },
    },
  );

  return proxy;
}

module.exports = createSwappableProxy;
