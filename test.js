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

test('lock(<process>, <callback>)', t => {
  const lock = createLockCb()
  lock(quickUnlock(null, 'hello'), (err, arg) => {
    t.equals(err, null)
    t.equals(arg, 'hello')
    t.end()
  })
})

test('Err: lock(<process>, <callback>)', t => {
  const lock = createLockCb()
  const myErr = new Error()
  lock(quickUnlock(myErr), err => {
    t.equals(err, myErr)
    t.end()
  })
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

test('immediate lock on unlock waits a little', t => {
  const lock = createLockCb()
  const stack = []
  lock(setImmediate, () => {
    lock(unlock => {
      stack.push(1)
      unlock()
    })
    lock(unlock => {
      stack.push(2)
      unlock()
    })
    t.deepEqual(stack, [])
    setImmediate(() => {
      t.deepEqual(stack, [1, 2])
      t.end()
    })
  })
  setImmediate(() => {
    t.deepEqual(stack, [])
  })
})

test('400 operations unlock within a frame', t => {
  const lock = createLockCb()
  const stack = []
  const expectedStack = []
  for (let i = 0; i < 400; i++) {
    expectedStack.push(i)
    lock(unlock => {
      stack.push(i)
      unlock()
    })
  }
  setImmediate(() => {
    t.deepEqual(stack, expectedStack)
    t.end()
  })
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

test('error data to be passed to onRejected error', t => {
  const lock = createLockCb()
  const error = new Error('some error')
  lock(function (unlock) {
    unlock(error, 'data passed')
  }, (thrownError, data) => {
    t.equals(thrownError, error)
    t.equals(data, 'data passed')
    t.end()
  })
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

test('simple sync-wrap api', t => {
  const lock = createLockCb()
  t.equals(
    lock.syncWrap((a, b) => {
      t.equals(a, 'hello')
      t.equals(b, 'world')
    })('hello', 'world'),
    undefined
  )
  lock.sync(() => t.end())
})

test('sync-wrap with timeout', t => {
  const lock = createLockCb()
  lock(() => {})
  lock.syncWrap(() => {}, 1, error => {
    t.equals(error.code, 'ETIMEOUT')
    t.end()
  })()
})

test('sync-wrap with timeout and onError flipped', t => {
  const lock = createLockCb()
  lock(() => {})
  lock.syncWrap(() => {}, error => {
    t.equals(error.code, 'ETIMEOUT')
    t.end()
  }, 1)()
})

const isGreaterNode4 = /^v(\d+)/.exec(process.version)[1] > 4
if (isGreaterNode4) {
  test('sync-wrap error case', t => {
    const lock = createLockCb()
    t.expectUncaughtException()
    lock.syncWrap(() => {
      throw new Error('my-error')
    })()
    lock.sync(() => {
      setImmediate(() => t.end())
    })
  })
}

test('sync waiting', t => {
  const lock = createLockCb()
  let waited = false
  let called = false
  lock(unlock => {
    setImmediate(() => {
      t.equals(called, false)
      waited = true
      unlock()
    })
  })
  lock.sync(() => {
    t.equals(waited, true)
    called = true
  })
  lock.sync(() => t.end())
})

test('syncWrap-error', t => {
  const stack = []
  const err = new Error()
  const lock = createLockCb(null, err => stack.push({ err, parent: true }))
  lock.syncWrap(() => { throw err })()
  lock.syncWrap(() => { throw err }, err => stack.push({ err, parent: false }))()
  t.deepEqual(stack, [])
  setImmediate(() => {
    setImmediate(() => {
      t.deepEqual(stack, [
        { err, parent: true },
        { err, parent: false }
      ])
      t.end()
    })
  })
})

test('sync result', t => {
  const lock = createLockCb()
  lock.sync(() => 'hi', (err, data) => {
    t.equals(err, null)
    t.equals(data, 'hi')
    t.end()
  })
})

test('sync error', t => {
  const lock = createLockCb()
  const err = new Error()
  lock.sync(() => { throw err }, thrownErr => {
    t.equals(thrownErr, err)
    t.end()
  })
})

test('sync promise', t => {
  const lock = createLockCb()
  lock.sync(() => 'hi').then(data => {
    t.equal(data, 'hi')
    t.end()
  })
})

test('simple destroy', () => {
  const lock = createLockCb()
  return lock.destroy()
})

test('destroy during operation waits for operation to finish', t => {
  const lock = createLockCb()
  let opFinished = false
  lock(
    cb => setTimeout(cb, 10, null, 'hello'),
    (err, data) => {
      opFinished = true
      t.equals(err, null)
      t.equals(data, 'hello')
    }
  )
  setImmediate(lock.destroy, () => {
    t.equals(opFinished, true)
    t.end()
  })
})

test('destroy will stop operations in queue', t => {
  const lock = createLockCb()
  let opFinished = false
  lock(cb => setTimeout(cb, 10))
  lock(
    () => t.fail('this should not be called'),
    (err, data) => {
      opFinished = true
      t.equals(err.message, 'Lock destroyed.')
      t.equals(err.code, 'E_DESTROYED')
      t.equals(data, undefined)
    }
  )
  setImmediate(lock.destroy, () => {
    t.equals(opFinished, true)
    t.end()
  })
})

test('custom error on destroy should be passed on', t => {
  const lock = createLockCb()
  const destroyError = new Error('some error')
  lock.destroy(destroyError)
  lock(
    () => t.fail('this should not be called'),
    (err, data) => {
      t.equals(err, destroyError)
      t.equals(data, undefined)
      t.end()
    }
  )
})

test('repeat destroying will show the first destroy message', t => {
  const lock = createLockCb()
  const err1 = new Error()
  const err2 = new Error()
  return lock.destroy(err1)
    .then(result => {
      t.deepEqual(result, { destroyed: err1, released: true })
      return lock.destroy(err2)
    })
    .then(result => {
      t.deepEqual(result, { destroyed: err1, released: true })
      return lock(cb => {
        setImmediate(cb)
      })
        .then(
          () => t.fail('Error expected'),
          err => {
            t.equals(err, err1)
          }
        )
    })
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
