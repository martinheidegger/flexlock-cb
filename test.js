'use strict'
const test = require('tap').test
const createLockCb = require('./index.js').createLockCb

test('lock(<process>)', () => {
  const lock = createLockCb()
  return lock(quickUnlock())
})

test('lock(<process>, <timeout>)', () => {
  const lock = createLockCb()
  return lock(quickUnlock(), 10)
})

test('lock(<process>, <timeout>, <null>)', () => {
  const lock = createLockCb()
  return lock(quickUnlock(), 10, null)
})

test('lock(<process>, <timeout>, <undefined>)', () => {
  const lock = createLockCb()
  return lock(quickUnlock(), 10, undefined)
})

test('lock(<process>, <timeout>, <callback>)', t => {
  const lock = createLockCb()
  lock(quickUnlock(), 10, () => {
    t.end()
  })
})

test('lock(<process>, <callback>, <timeout>)', t => {
  const lock = createLockCb()
  lock(quickUnlock(), () => {
    t.end()
  }, 10)
})

test('lock(<process>, <timeout>, <onFulFillment>, <onRejected>)', t => {
  const lock = createLockCb()
  lock(quickUnlock('err'), 10, () => {
    t.fail('should not be called')
  }, err => {
    t.equals(err, 'err')
    t.pass('a')
    t.end()
  })
})

test('lock(<process>, <onFulFillment>, <onRejected>, <timeout>)', t => {
  const lock = createLockCb()
  lock(quickUnlock('err'), () => {
    t.fail('should not be called')
  }, err => {
    t.equals(err, 'err')
    t.pass('a')
    t.end()
  }, 10)
})

test('Lock with deferred unlock', t => {
  const lock = createLockCb()
  let firstLockDone = false
  return Promise.all([
    lock(unlock => {
      firstLockDone = true
      unlock()
    }),
    lock(unlock => {
      t.equals(firstLockDone, true)
      unlock()
    })
  ])
})

test('Lock with timeout', t => {
  const lock = createLockCb()
  return Promise.all([
    lock(unlockDelay(5)),
    lock(_ => t.fail('passed regularily'), 1)
      .catch(err => {
        t.equals(err.code, 'ETIMEOUT')
        t.equals(err.message, 'Timeout[t=1]')
        t.equals(err.timeout, 1)
      })
  ])
})

test('Two locks with promise in handler and timeout', t => {
  const lock = createLockCb()
  return Promise.all([
    lock(quickUnlock()),
    lock(quickUnlock(new Error('a')), 100)
      .then(() => t.fail('The error should be propagated'))
      .catch(err => t.equals(err.message, 'a', 'error a is properly passed through from the promise')),
    lock(quickUnlock())
  ])
})

test('Multiple locks will call onReleased', t => {
  const lock = createLockCb(() => {
    t.ok('onRelease called!')
    t.end()
  })
  lock(quickUnlock())
  lock(quickUnlock())
})

test('Lock with promise in handler', t => {
  const lock = createLockCb()
  let firstLockDone = false
  return Promise.all([
    lock(quickUnlock(null, 'lockA'))
      .then(data => {
        firstLockDone = true
        t.equals(data, 'lockA', 'data a is properly passed through from the promise')
      }),
    lock(quickUnlock(null, 'lockB'))
      .then(data => {
        t.equals(data, 'lockB', 'data is properly passed through from the promise')
        t.equals(firstLockDone, true)
      })
  ])
})

test('Pass through error in handler process', t => {
  const lock = createLockCb()
  return lock(quickUnlock(new Error('a')))
    .then(() => t.fail('The error should be propagated'))
    .catch(err => t.equals(err.message, 'a', 'error a is properly passed through from the promise'))
})

test('Untriggered lock is released', t => {
  const lock = createLockCb()
  lock.released(() => t.end())
})

test('A triggered lock blocks a release', t => {
  const lock = createLockCb()
  let count = 0
  lock(unlock => {
    t.equals(count++, 0)
    unlock()
  })
  lock.released(() => {
    t.equals(count++, 1)
    t.end()
  })
})

test('Releases work as promised', t => {
  const lock = createLockCb()
  const stack = []

  return Promise.all([
    lock.released().then(() => stack.push('a')),
    lock.released().then(() => stack.push('b'))
  ]).then(() => t.deepEqual(stack, ['a', 'b']))
})

test('onReleased is call every time the lock is unlocked', t => {
  const stack = []
  const lock = createLockCb(() => stack.push('released'))
  function stackUnlock (name) {
    return unlock => {
      stack.push(name)
      unlock()
    }
  }
  lock(stackUnlock('a'))
  stack.push('start')
  return lock(stackUnlock('b'))
    .then(() => wait(2))
    .then(() => lock(stackUnlock('c')))
    .then(() => wait(2))
    .then(() => lock(stackUnlock('d')))
    .then(() => wait(2))
    .then(() =>
      t.deepEqual(stack, [
        'start', 'a', 'b', 'released', 'c', 'released', 'd', 'released'
      ])
    )
})

test('release started after a lock shouldnt misfire', t => {
  const lock = createLockCb()
  const stack = []
  return Promise.all([
    lock.released().then(function () {
      stack.push('release')
    }),
    lock(unlock => {
      stack.push('a')
      unlock()
    })
  ]).then(() =>
    t.deepEqual(stack, [
      'a', 'release'
    ])
  )
})

test('released started after a lock shouldnt misfire with a delay', t => {
  const lock = createLockCb()
  const stack = []
  return Promise.all([
    lock.released().then(function () {
      stack.push('release')
    }),
    lock(unlock => {
      stack.push('a')
      setTimeout(unlock, 10)
    })
  ]).then(() =>
    t.deepEqual(stack, [
      'a', 'release'
    ])
  )
})

test('making sure that the response is passed through', t => {
  const lock = createLockCb()
  return lock(function (unlock) {
    unlock(null, 'hello')
  }).then(data => t.equals(data, 'hello'))
})

test('multiple unlocks dont crash the system', t => {
  const lock = createLockCb()
  lock(unlockCb => {
    unlockCb()
    setImmediate(() => {
      unlockCb()
      t.end()
    })
  }).catch(() =>
    t.fail('Double calls shouldnt result in errors')
  )
})

test('async calls with errors should be caught', t => {
  const lock = createLockCb()
  const err = new Error('fancy!')
  lock(() => {
    throw err
  }).catch(caughtErr => {
    t.equals(caughtErr, err)
    t.end()
  })
})

test('multiple release listeners at the same lock', t => {
  const lock = createLockCb()
  const stack = []
  lock.released(() => { stack.push('a') })
  lock.released(() => { stack.push('b') })
  lock.released(() => { stack.push('c') })
  return lock(unlockDelay(1))
    .then(() => {
      t.deepEqual(stack, ['a', 'b', 'c'])
      t.end()
    })
})

test('unlocking with empty triggers', t => {
  const lock = createLockCb()
  return lockTwice(lock)
})

test('once released then empty triggers', t => {
  const lock = createLockCb()
  const p = lockTwice(lock)
  lock.released(() => {})
  return p
})

function lockTwice (lock) {
  return lock(quickUnlock())
    .then(() => wait(1))
    .then(() => lock(quickUnlock()))
    .then(() => wait(1))
}

function quickUnlock (error, data) {
  return unlockDelay(1, error, data)
}

function unlockDelay (timeout, error, data) {
  return unlock => setTimeout(unlock, timeout, error, data)
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
