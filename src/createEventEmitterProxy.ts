// This package relies on the EventEmitter type.
// eslint-disable-next-line import/no-nodejs-modules
import type { EventEmitter } from 'events';

import type { SwappableProxy } from './types';

const filterNoop = () => true;
const internalEvents: (string | symbol)[] = ['newListener', 'removeListener'];
const externalEventFilter = (name: string | symbol) =>
  !internalEvents.includes(name);

/**
 * Creates a proxy object that initially points to the given object but whose
 * target can be substituted with another object later using its `setTarget`
 * method. In addition, when the target is changed, event listeners which have
 * been attached to the target will be detached and migrated to the new target.
 *
 * @param initialTarget - The initial object you want to wrap.
 * @param opts - The options.
 * @param opts.eventFilter - Usually, listeners for all events will be migrated
 * from old targets to new targets, but this function can be used to select
 * which events you want to migrate. If you pass `'skipInternal'`, then
 * `newListener` and `removeListener` will be excluded.
 * @returns The proxy object.
 */
export function createEventEmitterProxy<T extends EventEmitter>(
  initialTarget: T,
  {
    eventFilter: givenEventFilter = filterNoop,
  }: {
    eventFilter?: ((eventName: string | symbol) => boolean) | 'skipInternal';
  } = {},
): SwappableProxy<T> {
  // parse options
  const eventFilter =
    givenEventFilter === 'skipInternal'
      ? externalEventFilter
      : givenEventFilter;

  if (typeof eventFilter !== 'function') {
    throw new Error('createEventEmitterProxy - Invalid eventFilter');
  }

  let target = initialTarget;

  /**
   * Changes the object that the proxy wraps.
   *
   * @param newTarget - The new object.
   */
  let setTarget = (newTarget: any) => {
    const oldTarget = target;
    target = newTarget;
    // migrate listeners
    oldTarget
      .eventNames()
      .filter(eventFilter)
      .forEach((name) => {
        oldTarget
          .rawListeners(name)
          .forEach((handler) => newTarget.on(name, handler));
      });
    // remove old
    oldTarget.removeAllListeners();
  };

  const proxy: SwappableProxy<T> = new Proxy<any>(target, {
    get: (_, name, receiver: T) => {
      // override `setTarget` access
      if (name === 'setTarget') {
        return setTarget;
      }

      // Typecast: We cannot typecast `name` in the arguments for this option
      // because it conflicts with the function signature, so we need to
      // typecast `target` instead.
      const value = (target as any)[name];
      if (value instanceof Function) {
        return function (this: unknown, ...args: any[]) {
          // This function may be either bound to something or nothing.
          // eslint-disable-next-line no-invalid-this
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
      // Typecast: We cannot typecast `name` in the arguments for this option
      // because it conflicts with the function signature, so we need to
      // typecast `target` instead.
      (target as any)[name] = value;
      return true;
    },
  });

  return proxy;
}
