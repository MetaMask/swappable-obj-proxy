import EventEmitter from 'events';

import { createEventEmitterProxy } from '.';

describe('createEventEmitterProxy', () => {
  it('migrates event listeners when switching the target', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();
    const proxy = createEventEmitterProxy(original);

    let sawEvent = 0;
    proxy.on('event', () => {
      sawEvent += 1;
    });

    proxy.setTarget(next);
    original.emit('event');
    expect(sawEvent).toBe(0);

    next.emit('event');
    expect(sawEvent).toBe(1);
  });

  it('proxies the "once" method to the target', () => {
    const original = new EventEmitter();
    const proxy = createEventEmitterProxy(original);

    let sawEvent = 0;
    proxy.once('event', () => {
      sawEvent += 1;
    });

    original.emit('event');
    original.emit('event');

    expect(sawEvent).toBe(1);
  });

  it('only migrates the once method if the handler has not yet been called', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();
    const proxy = createEventEmitterProxy(original);

    let sawEvent = 0;
    proxy.once('event', () => {
      sawEvent += 1;
    });

    original.emit('event');

    expect(sawEvent).toBe(1);
    proxy.setTarget(next);
    next.emit('event');
    next.emit('event');
    proxy.setTarget(original);
    next.emit('event');
    original.emit('event');

    expect(sawEvent).toBe(1);
  });

  it('proxies methods to the target', () => {
    class ExampleSubclass extends EventEmitter {
      test: () => void;

      constructor(testHandler: () => void) {
        super();
        this.test = testHandler;
      }
    }
    let originalTests = 0;
    let nextTests = 0;

    const original = new ExampleSubclass(() => {
      originalTests += 1;
    });
    const next = new ExampleSubclass(() => {
      nextTests += 1;
    });
    const proxy = createEventEmitterProxy(original);

    expect(originalTests).toBe(0);
    expect(nextTests).toBe(0);

    proxy.test();
    expect(originalTests).toBe(1);
    expect(nextTests).toBe(0);

    proxy.setTarget(next);
    proxy.test();
    expect(originalTests).toBe(1);
    expect(nextTests).toBe(1);
  });

  it('honors the eventFilter option to control which events are migrated when the target is switched', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();

    const skippableEvents: (string | symbol)[] = ['a'];
    // only transfer events that are not EE internal events
    const proxy = createEventEmitterProxy(original, {
      eventFilter: (name: string | symbol) => !skippableEvents.includes(name),
    });

    let sawEvent = 0;
    proxy.on('a', () => {
      sawEvent += 1;
    });

    proxy.setTarget(next);
    original.emit('a');
    expect(sawEvent).toBe(0);

    next.emit('a');
    expect(sawEvent).toBe(0);
  });

  it('removes listeners that were filtered', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();

    // only filter all events
    const proxy = createEventEmitterProxy(original, {
      eventFilter: () => false
    });

    let sawEvent = 0;
    proxy.on('a', () => {
      sawEvent += 1;
    });
    original.emit('a');
    expect(sawEvent).toBe(1);
    proxy.setTarget(next);
    original.emit('a');
    expect(sawEvent).toBe(1);
    next.emit('a');
    expect(sawEvent).toBe(1);
  });

  it('excludes internal events when eventFilter is "skipInternal"', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();

    // only transfer events that are not EE internal events
    const proxy = createEventEmitterProxy(original, {
      eventFilter: 'skipInternal',
    });

    let sawEvent = 0;
    proxy.on('newListener', () => {
      sawEvent += 1;
    });

    proxy.setTarget(next);
    original.emit('newListener');
    expect(sawEvent).toBe(0);

    next.emit('newListener');
    expect(sawEvent).toBe(0);
  });

  it('throws if eventFilter is not a function or "skipInternal"', () => {
    const original = new EventEmitter();

    expect(() => {
      createEventEmitterProxy(original, {
        eventFilter: 'foobar' as any,
      });
    }).toThrow('createEventEmitterProxy - Invalid eventFilter');
  });

  it('proxies a method on an instance of a class that calls another instance method', () => {
    class ExampleClass extends EventEmitter {
      foo() {
        return this.bar();
      }

      bar() {
        return 42;
      }
    }
    const underlying = new ExampleClass();
    const proxy = createEventEmitterProxy(underlying);

    expect(proxy.foo()).toBe(42);
  });

  it('proxies a method on an instance of a class that references a private field', () => {
    class ExampleClass extends EventEmitter {
      #qux = false;

      bar() {
        this.#qux = true;
        return this.#baz();
      }

      #baz() {
        return [this.#qux, 42];
      }
    }
    const underlying = new ExampleClass();
    const proxy = createEventEmitterProxy(underlying);

    expect(proxy.bar()).toStrictEqual([true, 42]);
  });

  it('only migrates events that were added via the proxy, not all the events', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();

    let moveCount = 0;
    let dontMoveCount = 0;
    original.on('shouldNotMove', () => (dontMoveCount += 1));

    const proxy = createEventEmitterProxy(original);
    expect(proxy.eventNames()[0]).toBe('shouldNotMove');
    proxy.on('shouldMove', () => (moveCount += 1));
    proxy.setTarget(next);
    next.emit('shouldMove');
    expect(moveCount).toBe(1);
    next.emit('shouldNotMove');
    expect(dontMoveCount).toBe(0);
  });

  it('does not migrate events that have been removed via "off"', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();

    const proxy = createEventEmitterProxy(original);
    let count = 0;
    const inc = () => (count += 1);
    proxy.on('foo', inc);
    original.emit('foo');
    expect(count).toBe(1);
    proxy.off('foo', inc);
    original.emit('foo');
    expect(count).toBe(1);
    proxy.setTarget(next);
    next.emit('foo');
    expect(count).toBe(1);
  });

  it('does not migrate events that have been removed via "removeListener"', () => {
    const original = new EventEmitter();
    const next = new EventEmitter();

    const proxy = createEventEmitterProxy(original);
    let count = 0;
    const inc = () => (count += 1);
    proxy.on('foo', inc);
    original.emit('foo');
    expect(count).toBe(1);
    proxy.removeListener('foo', inc);
    original.emit('foo');
    expect(count).toBe(1);
    proxy.setTarget(next);
    next.emit('foo');
    expect(count).toBe(1);
  });

  it('can set properties on the proxied event emitter', () => {
    const original = new EventEmitter();
    const proxy = createEventEmitterProxy(original);
    (proxy as any).foo = 123;
    expect((original as any).foo).toBe(123);
  });

  it('can get values that are non-functions', () => {
    const original = new EventEmitter();
    const proxy = createEventEmitterProxy(original);
    expect((proxy as any)._eventsCount).toBe(0);
  });

  it('can set a custom "setTarget" method', () => {
    const original = new EventEmitter();
    const proxy = createEventEmitterProxy(original);
    const mockSetTarget = jest.fn();
    proxy.setTarget = mockSetTarget;

    const next = new EventEmitter();
    proxy.setTarget(next);
    expect(mockSetTarget).toHaveBeenCalledWith(next);
  });

  it('can handle the context being the proxy itself', () => {
    const original = new EventEmitter();
    const proxy = createEventEmitterProxy(original);

    proxy.on.call(this, 'testEvent', function(this: typeof original) {
      expect(this).toBe(original);
    });

    proxy.emit('testEvent');
  });
});
