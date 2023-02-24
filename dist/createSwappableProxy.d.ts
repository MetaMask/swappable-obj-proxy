import type { SwappableProxy } from './types';
/**
 * Creates a proxy object that initially points to the given object but whose
 * target can be substituted with another object later using its `setTarget`
 * method.
 *
 * @template Type - An object.
 * @param initialTarget - The initial object you want to wrap.
 * @returns The proxy object.
 */
export declare function createSwappableProxy<Type extends object>(initialTarget: Type): SwappableProxy<Type>;
