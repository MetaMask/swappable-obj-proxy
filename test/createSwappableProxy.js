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
