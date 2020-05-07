'use strict'
const createLock = require('./lib/createLock.js')

function toPromise (lock, process, timeout) {
  return new Promise(lock.bind(null, process, timeout))
}

function noop () {}

function throwErr (err) {
  // We need to wait with throwing the error, else the lock may
  // not be released!
  setImmediate(() => {
    throw err
  })
}

module.exports = function createLockCb (onEveryRelease, onSyncError) {
  const lock = createLock(onEveryRelease)
  if (typeof onSyncError !== 'function') {
    onSyncError = throwErr
  }
  const flexLock = function (process, arg1, arg2, arg3) {
    let timeout, onFulfilled, onRejected
    if (typeof arg1 === 'function') {
      onFulfilled = arg1
      if (typeof arg2 === 'function') {
        onRejected = arg2
        timeout = arg3
      } else {
        timeout = arg2
      }
    } else {
      timeout = arg1
      if (typeof arg2 === 'function') {
        onFulfilled = arg2
        if (typeof arg3 === 'function') {
          onRejected = arg3
        }
      }
    }
    if (typeof timeout !== 'number' || Number.isNaN(timeout)) {
      timeout = 0
    }
    if (onFulfilled === undefined) {
      return toPromise(lock, process, timeout)
    }
    if (onRejected === undefined) {
      onRejected = onFulfilled
      onFulfilled = function (data) {
        onRejected(null, data)
      }
    }
    lock(process, timeout, onFulfilled, onRejected)
  }
  flexLock.syncWrap = function (syncProcess, timeout, onError) {
    if (typeof timeout === 'function') {
      const flip = timeout
      timeout = onError
      onError = flip
    }
    if (timeout === undefined || timeout === null) {
      timeout = 0
    }
    return function () {
      const args = arguments
      flexLock(function (unlock) {
        syncProcess.apply(null, args)
        unlock()
      }, timeout, noop, onError || onSyncError)
    }
  }
  flexLock.sync = function (syncProcess, timeout, onFulfilled, onRejected) {
    return flexLock(function (unlock) {
      let result
      try {
        result = syncProcess(flexLock)
      } catch (err) {
        return unlock(err)
      }
      unlock(null, result)
    }, timeout, onFulfilled, onRejected)
  }
  flexLock.cb = flexLock
  flexLock.released = lock.released
  flexLock.destroy = lock.destroy
  return flexLock
}
