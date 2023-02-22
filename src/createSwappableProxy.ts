import type { SwappableProxy } from './types';

/**
 * Creates a proxy object that initially points to the given object but whose
 * target can be substituted with another object later using its `setTarget`
 * method.
 *
 * @param initialTarget - The initial object you want to wrap.
 * @returns The proxy object.
 */
export function createSwappableProxy<T>(initialTarget: T): SwappableProxy<T> {
  let target = initialTarget;

  /**
   * Changes the object that the proxy wraps.
   *
   * @param newTarget - The new object.
   */
  let setTarget = (newTarget: T) => {
    target = newTarget;
  };

  const proxy: SwappableProxy<T> = new Proxy<any>(target, {
    get: (_, name, receiver) => {
      // override `setTarget` access
      if (name === 'setTarget') {
        return setTarget;
      }

      // Typecast: We cannot typecast `name` in the arguments for this option
      // because it conflicts with the function signature, so we need to
      // typecast `target` instead.
      const value = (target as any)[name];
      if (value instanceof Function) {
        return function (this: T | undefined, ...args: any[]) {
          // This function may be a method bound to the proxy object, or an
          // unbound function.
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
