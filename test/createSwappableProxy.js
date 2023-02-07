const test = require('tape')
const EventEmitter = require('events')
const { createSwappableProxy } = require('../src/index')

test('createSwappableProxy - basic', (t) => {
  const original = { value: 1 }
  const next = { value: 2 }
  const proxy = createSwappableProxy(original)

  t.equal(proxy.value, 1, 'value comes from original')

  proxy.setTarget(next)
  t.equal(proxy.value, 2, 'value comes from next')

  t.end()
})

test('createSwappableProxy - setTarget twice ', (t) => {
  const original = { value: 0 }
  const one = { value: 1 }
  const two = { value: 2 }
  const proxy = createSwappableProxy(original)

  t.equal(proxy.value, 0, 'value comes from original')

  proxy.setTarget(one)
  t.equal(proxy.value, 1, 'value comes from one')

  proxy.setTarget(two)
  t.equal(proxy.value, 2, 'value comes from two')


  t.end()
})

test('createSwappableProxy - calling a method', (t) => {
  const underlying = {
    foo() {
      return this.bar();
    },
    bar() {
      return 42;
    }
  }
  const proxy = createSwappableProxy(underlying)

  t.equal(proxy.foo(), 42)

  t.end()
})

test('createSwappableProxy - calling a method on an instance of a class with private fields', (t) => {
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
  const underlying = new Foo()
  const proxy = createSwappableProxy(underlying)

  t.deepEqual(proxy.bar(), [true, 42])

  t.end()
})
