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
    const next = new EventEmitter();
    const proxy = createEventEmitterProxy(original);

    let sawEvent = 0;
    proxy.once('event', () => {
      sawEvent += 1;
    });

    proxy.setTarget(next);
    next.emit('event');
    next.emit('event');

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
});
