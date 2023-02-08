declare module '@metamask/swappable-obj-proxy' {
  export type SwappableProxy<T = unknown> = T & {
    setTarget: (newTarget: T) => void,
  };

  export function createEventEmitterProxy<T = unknown>(
    initialTarget: T,
    options?: {
      eventFilter?: ((eventName: string) => boolean) | 'skipInternal';
    },
  ): SwappableProxy<T>;

  export function createSwappableProxy<T = unknown>(initialTarget: unknown): SwappableProxy<T>;
}
