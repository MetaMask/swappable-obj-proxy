/**
 * Represents the proxy object, which wraps a target object. As a result, it
 * allows for accessing and setting all of the properties that the target object
 * supports, but also supports an extra method to switch the target.
 *
 * @member setTarget - Allows for switching the target.
 * @template Type - The type of the object you want to wrap. It is assumed that
 * you will maintain this type even when swapping out the target.
 */
export type SwappableProxy<Type extends object> = Type & {
  setTarget: (newTarget: Type) => void;
};

/**
 * A portion of Node's EventEmitter interface that `createEventEmitterProxy`
 * expects its `target` to support.
 */
export type EventEmitterLike = {
  eventNames: () => (string | symbol)[];
  // The `rawListeners` method returns an array of `Function`s.
  // eslint-disable-next-line @typescript-eslint/ban-types
  rawListeners(eventName: string | symbol): Function[];
  removeAllListeners(event?: string | symbol): EventEmitterLike;
  on(name: string, handler: (...args: unknown[]) => unknown): void;
  prependListener(name: string, handler: (...args: unknown[]) => unknown): void;
  addListener(name: string, handler: (...args: unknown[]) => unknown): void;
  off(name: string, handler: (...args: unknown[]) => unknown): void;
  once(name: string, handler: (...args: unknown[]) => unknown): void;
};
