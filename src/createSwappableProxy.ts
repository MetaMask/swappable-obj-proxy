import type { SwappableProxy } from './types';

/**
 * Creates a proxy object that initially points to the given object but whose
 * target can be substituted with another object later using its `setTarget`
 * method.
 *
 * @param initialTarget - The initial object you want to wrap.
 * @returns The proxy object.
 */
export function createSwappableProxy<T extends object>(
  initialTarget: T,
): SwappableProxy<T> {
  let target = initialTarget;

  /**
   * Changes the object that the proxy wraps.
   *
   * @param newTarget - The new object.
   */
  let setTarget = (newTarget: T) => {
    target = newTarget;
  };

  const proxy = new Proxy<T>(target, {
    get(
      localTarget: T & { [key: string | symbol]: unknown },
      name: 'setTarget' | keyof T | string | symbol,
      receiver: SwappableProxy<T>,
    ): unknown {
      // override `setTarget` access
      if (name === 'setTarget') {
        return setTarget;
      }

      const value = localTarget[name];
      if (value instanceof Function) {
        return function (this: unknown, ...args: any[]) {
          // This function may be either bound to something or nothing.
          // eslint-disable-next-line no-invalid-this
          return value.apply(this === receiver ? target : this, args);
        };
      }
      return value;
    },
    set(
      localTarget: T & Record<string | symbol, unknown>,
      name: 'setTarget' | keyof T | string | symbol,
      // This setter takes either the `setTarget` function, the value of a a
      // known property of T, or something else. However, the type of this value
      // depends on the property given, and getting TypeScript to figure this
      // out is seriously difficult. It doesn't ultimately matter, however,
      // as the setter is not visible to consumers.
      value: any,
    ): boolean {
      // allow `setTarget` overrides
      if (name === 'setTarget') {
        setTarget = value;
        return true;
      }
      localTarget[name] = value;
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
