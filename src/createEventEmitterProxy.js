const filterNoop = () => true;
const internalEvents = ['newListener', 'removeListener'];
const externalEventFilter = (name) => !internalEvents.includes(name);

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
 * method. In addition, when the target is changed, event listeners which have
 * been attached to the target will be detached and migrated to the new target.
 *
 * @param {any} initialTarget - The initial object you want to wrap.
 * @param {{eventFilter?: ((eventName: string) => boolean) | 'skipInternal'}} opts - The options.
 * @param {((eventName: string) => boolean) | 'skipInternal'} opts.eventFilter - Usually,
 * listeners for all events will be migrated from old targets to new targets,
 * but this function can be used to select which events you want to migrate. If
 * you pass `'skipInternal'`, then `newListener` and `removeListener` will be
 * excluded.
 * @returns {SwappableProxy} The proxy object.
 */
function createEventEmitterProxy(initialTarget, opts = {}) {
  // parse options
  let eventFilter = opts.eventFilter || filterNoop;
  if (eventFilter === 'skipInternal') {
    eventFilter = externalEventFilter;
  }
  if (typeof eventFilter !== 'function') {
    throw new Error('createEventEmitterProxy - Invalid eventFilter');
  }

  let target = initialTarget;

  /**
   * Changes the object that the proxy wraps.
   *
   * @param {any} newTarget - The new object.
   */
  let setTarget = (newTarget) => {
    const oldTarget = target;
    target = newTarget;
    // migrate listeners
    oldTarget
      .eventNames()
      .filter(eventFilter)
      .forEach((name) => {
        getRawListeners(oldTarget, name).forEach((handler) =>
          newTarget.on(name, handler),
        );
      });
    // remove old
    oldTarget.removeAllListeners();
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

/**
 * Obtains the listeners for an event from the event emitter object.
 *
 * @param {EventEmitter} eventEmitter - The event emitter.
 * @param {string} name - The name of the event.
 * @returns {Function} The event listeners.
 */
function getRawListeners(eventEmitter, name) {
  // prefer native
  if (eventEmitter.rawListeners) {
    return eventEmitter.rawListeners(name);
  }
  // fallback to lookup against internal object
  let events = eventEmitter._events[name] || [];
  // ensure array
  if (!Array.isArray(events)) {
    events = [events];
  }
  // return copy
  return events.slice();
}

module.exports = createEventEmitterProxy;
