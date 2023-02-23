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
  let setTarget = (newTarget: T) => {
    const oldTarget = target;
    target = newTarget;
    // migrate listeners
    oldTarget
      .eventNames()
      .filter(eventFilter)
      .forEach((name) => {
        oldTarget.rawListeners(name).forEach((handler) => {
          // @ts-expect-error `rawListeners` returns `Function[]`, but `on`
          // takes `(...args: any[]) => void`.
          newTarget.on(name, handler);
        });
      });
    // remove old
    oldTarget.removeAllListeners();
  };

  const proxy = new Proxy<T>(target, {
    // @ts-expect-error The type of `get` in the Proxy interface is too loose,
    // as it allows `name` to be anything, despite the Proxy constructor taking
    // a type parameter.
    get(
      _target: T,
      name: 'setTarget' | keyof T,
      receiver: SwappableProxy<T>,
    ): typeof setTarget | T[keyof T] {
      // override `setTarget` access
      if (name === 'setTarget') {
        return setTarget;
      }

      const value = target[name];
      if (value instanceof Function) {
        return function (this: unknown, ...args: any[]) {
          // This function may be either bound to something or nothing.
          // eslint-disable-next-line no-invalid-this
          return value.apply(this === receiver ? target : this, args);
        };
      }
      return value;
    },
    // @ts-expect-error The type of `set` in the Proxy interface is too loose,
    // as it allows `name` to be anything, despite the Proxy constructor taking
    // a type parameter.
    set(
      _target: T,
      name: 'setTarget' | keyof T,
      value: typeof setTarget | T[keyof T],
    ): boolean {
      // allow `setTarget` overrides
      if (name === 'setTarget') {
        // @ts-expect-error TypeScript should be able to tell that `value` is
        // `typeof setTarget`, but cannot.
        setTarget = value;
        return true;
      }
      // @ts-expect-error TypeScript should be able to tell that `value` is
      // `T[keyof T]`, but cannot.
      target[name] = value;
      return true;
    },
  });

  // Typecast: The return type of the Proxy constructor is defined to be the
  // same as the provided type parameter. This is naive, however, as it does not
  // account for the proxy trapping and responding to arbitrary properties; in
  // our case, we trap `setTarget`, so this means our final proxy object
  // contains a property on top of the underlying object's properties.
  return proxy as SwappableProxy<T>;
}
