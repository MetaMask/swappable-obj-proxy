/**
 * Represents the proxy object, which wraps a target object. As a result, it
 * allows for accessing and setting all of the properties that the target object
 * supports, but also supports an extra method to switch the target.
 *
 * @property {(newTarget: any) => void} setTarget - Allows for switching the
 * target.
 * @template T - The type of the object you want to wrap. It is assumed that
 * you will maintain this type even when swapping out the target.
 */
export type SwappableProxy<T> = T & {
  setTarget: (newTarget: T) => void;
};
