const EventEmitter = require('events');

const { createEventEmitterProxy } = require('.');

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
      constructor(testHandler) {
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

    const skippableEvents = ['a'];
    // only transfer events that are not EE internal events
    const proxy = createEventEmitterProxy(original, {
      eventFilter: (name) => !skippableEvents.includes(name),
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
        eventFilter: 'foobar',
      });
    }).toThrow('createEventEmitterProxy - Invalid eventFilter');
  });

  it('proxies a method on an instance of a class that calls another instance method', () => {
    const underlying = {
      foo() {
        return this.bar();
      },
      bar() {
        return 42;
      },
    };
    const proxy = createEventEmitterProxy(underlying);

    expect(proxy.foo()).toBe(42);
  });

  it('proxies a method on an instance of a class that references a private field', () => {
    class Foo {
      #qux;

      bar() {
        this.#qux = true;
        return this.#baz();
      }

      #baz() {
        return [this.#qux, 42];
      }
    }
    const underlying = new Foo();
    const proxy = createEventEmitterProxy(underlying);

    expect(proxy.bar()).toStrictEqual([true, 42]);
  });
});
