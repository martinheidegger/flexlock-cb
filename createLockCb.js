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
  const flexLock = function (process, timeout, onFulfilled, onRejected) {
    if (typeof timeout === 'function') {
      if (typeof onFulfilled === 'function') {
        return lock(process, onRejected, timeout, onFulfilled)
      }
      return lock(process, onFulfilled, function (data) {
        timeout(null, data)
      }, timeout)
    }
    if (typeof onFulfilled !== 'function') {
      return toPromise(lock, process, timeout)
    }
    if (typeof onRejected !== 'function') {
      return lock(process, timeout, function (data) {
        onFulfilled(null, data)
      }, onFulfilled)
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
