const EventEmitter = require('events');
const test = require('tape');

const { createEventEmitterProxy } = require('../src');

test('createEventEmitterProxy - basic', (t) => {
  const original = new EventEmitter();
  const next = new EventEmitter();
  const proxy = createEventEmitterProxy(original);

  let sawEvent = 0;
  proxy.on('event', () => {
    sawEvent += 1;
  });

  proxy.setTarget(next);
  original.emit('event');
  t.equal(sawEvent, 0, 'handler was not called');

  next.emit('event');
  t.equal(sawEvent, 1, 'handler was called once');
  t.end();
});

test('createEventEmitterProxy - once', (t) => {
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

  t.equal(sawEvent, 1, 'handler was called only once');
  t.end();
});

test('createEventEmitterProxy - other methods', (t) => {
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

  t.equal(originalTests, 0, 'originalTests have not been called');
  t.equal(nextTests, 0, 'nextTests have not been called');

  proxy.test();
  t.equal(originalTests, 1, 'originalTests were called once');
  t.equal(nextTests, 0, 'nextTests have not been called');

  proxy.setTarget(next);
  proxy.test();
  t.equal(originalTests, 1, 'originalTests were called once');
  t.equal(nextTests, 1, 'nextTests were called once');

  t.end();
});

test('createEventEmitterProxy - eventFilter custom', (t) => {
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
  t.equal(sawEvent, 0, 'handler was not called');

  next.emit('a');
  t.equal(sawEvent, 0, 'handler was not called');
  t.end();
});

test('createEventEmitterProxy - eventFilter builtin', (t) => {
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
  t.equal(sawEvent, 0, 'handler was not called');

  next.emit('newListener');
  t.equal(sawEvent, 0, 'handler was not called');
  t.end();
});

test('createEventEmitterProxy - eventFilter bad', (t) => {
  const original = new EventEmitter();

  try {
    createEventEmitterProxy(original, {
      eventFilter: 'foobar',
    });
    t.fail('did not error');
  } catch (error) {
    t.ok(error, 'did error');
  }

  t.end();
});

test('createEventEmitterProxy - calling a method', (t) => {
  const underlying = {
    foo() {
      return this.bar();
    },
    bar() {
      return 42;
    },
  };
  const proxy = createEventEmitterProxy(underlying);

  t.equal(proxy.foo(), 42);

  t.end();
});

test('createEventEmitterProxy - calling a method on an instance of a class with private fields', (t) => {
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

  t.deepEqual(proxy.bar(), [true, 42]);

  t.end();
});
