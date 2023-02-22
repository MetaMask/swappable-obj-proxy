/// <reference types="node" />
import type { EventEmitter } from 'events';
import type { SwappableProxy } from './types';
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
export declare function createEventEmitterProxy<T extends EventEmitter>(initialTarget: T, { eventFilter: givenEventFilter, }?: {
    eventFilter?: ((eventName: string | symbol) => boolean) | 'skipInternal';
}): SwappableProxy<T>;
