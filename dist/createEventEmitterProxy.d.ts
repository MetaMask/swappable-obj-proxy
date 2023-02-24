import type { SwappableProxy } from './types';
/**
 * A portion of Node's EventEmitter interface that `createEventEmitterProxy`
 * expects its `target` to support.
 */
declare type EventEmitterLike = {
    eventNames: () => (string | symbol)[];
    rawListeners(eventName: string | symbol): Function[];
    removeAllListeners(event?: string | symbol): EventEmitterLike;
};
/**
 * Creates a proxy object that initially points to the given object but whose
 * target can be substituted with another object later using its `setTarget`
 * method. In addition, when the target is changed, event listeners which have
 * been attached to the target will be detached and migrated to the new target.
 *
 * @template Type - An object that implements at least `eventNames`, `rawListeners`,
 * and `removeAllListeners` from [Node's EventEmitter interface](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/events.d.ts).
 * @param initialTarget - The initial object you want to wrap.
 * @param opts - The options.
 * @param opts.eventFilter - Usually, listeners for all events will be migrated
 * from old targets to new targets, but this function can be used to select
 * which events you want to migrate. If you pass `'skipInternal'`, then
 * `newListener` and `removeListener` will be excluded.
 * @returns The proxy object.
 */
export declare function createEventEmitterProxy<Type extends EventEmitterLike>(initialTarget: Type, { eventFilter: givenEventFilter, }?: {
    eventFilter?: ((eventName: string | symbol) => boolean) | 'skipInternal';
}): SwappableProxy<Type>;
export {};
