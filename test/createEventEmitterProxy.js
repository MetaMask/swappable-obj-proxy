const test = require('tape')
const EventEmitter = require('events')
const { createEventEmitterProxy } = require('../src/index')


test('createEventEmitterProxy - basic', (t) => {
  const original = new EventEmitter()
  const next = new EventEmitter()
  const proxy = createEventEmitterProxy(original)

  let sawEvent = 0
  proxy.on('event', () => sawEvent++)

  proxy.setTarget(next)
  original.emit('event')
  t.equal(sawEvent, 0, 'handler was not called')

  next.emit('event')
  t.equal(sawEvent, 1, 'handler was called once')
  t.end()
})

test('createEventEmitterProxy - once', (t) => {
  const original = new EventEmitter()
  const next = new EventEmitter()
  const proxy = createEventEmitterProxy(original)

  let sawEvent = 0
  proxy.once('event', () => sawEvent++)

  proxy.setTarget(next)
  next.emit('event')
  next.emit('event')

  t.equal(sawEvent, 1, 'handler was called only once')
  t.end()
})

test('createEventEmitterProxy - other methods', (t) => {
  class ExampleSubclass extends EventEmitter {
    constructor(testHandler) {
      super()
      this.test = testHandler
    }
  }
  let originalTests = 0
  let nextTests = 0

  const original = new ExampleSubclass(() => originalTests++)
  const next = new ExampleSubclass(() => nextTests++)
  const proxy = createEventEmitterProxy(original)

  t.equal(originalTests, 0, 'originalTests have not been called')
  t.equal(nextTests, 0, 'nextTests have not been called')

  proxy.test()
  t.equal(originalTests, 1, 'originalTests were called once')
  t.equal(nextTests, 0, 'nextTests have not been called')

  proxy.setTarget(next)
  proxy.test()
  t.equal(originalTests, 1, 'originalTests were called once')
  t.equal(nextTests, 1, 'nextTests were called once')

  t.end()
})

test('createEventEmitterProxy - eventFilter custom', (t) => {
  const original = new EventEmitter()
  const next = new EventEmitter()

  const skippableEvents = ['a']
  // only transfer events that are not EE internal events
  const proxy = createEventEmitterProxy(original, {
    eventFilter: (name) => !skippableEvents.includes(name)
  })

  let sawEvent = 0
  proxy.on('a', () => sawEvent++)

  proxy.setTarget(next)
  original.emit('a')
  t.equal(sawEvent, 0, 'handler was not called')

  next.emit('a')
  t.equal(sawEvent, 0, 'handler was not called')
  t.end()
})

test('createEventEmitterProxy - eventFilter builtin', (t) => {
  const original = new EventEmitter()
  const next = new EventEmitter()

  // only transfer events that are not EE internal events
  const proxy = createEventEmitterProxy(original, {
    eventFilter: 'skipInternal'
  })

  let sawEvent = 0
  proxy.on('newListener', () => sawEvent++)

  proxy.setTarget(next)
  original.emit('newListener')
  t.equal(sawEvent, 0, 'handler was not called')

  next.emit('newListener')
  t.equal(sawEvent, 0, 'handler was not called')
  t.end()
})


test('createEventEmitterProxy - eventFilter bad', (t) => {
  const original = new EventEmitter()

  try {
    const proxy = createEventEmitterProxy(original, {
      eventFilter: 'foobar'
    })
    t.fail('did not error')
  } catch (err) {
    t.ok(err, 'did error')
  }

  t.end()
})
