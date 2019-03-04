'use strict'
function toPromise (rawLock, process, timeout) {
  return new Promise(rawLock.bind(null, process, timeout))
}

function noop () {}

function throwErr (err) {
  // We need to wait with throwing the error, else the lock may
  // not be released!
  setImmediate(() => {
    throw err
  })
}

module.exports = function applyFlexApi (rawLock, onSyncError) {
  if (typeof onSyncError !== 'function') {
    onSyncError = throwErr
  }
  const flexLock = function (process, timeout, onFulfilled, onRejected) {
    if (typeof timeout === 'function') {
      if (typeof onFulfilled === 'function') {
        return rawLock(process, onRejected, timeout, onFulfilled)
      }
      return rawLock(process, onFulfilled, function (data) {
        timeout(null, data)
      }, timeout)
    }
    if (typeof onFulfilled !== 'function') {
      return toPromise(rawLock, process, timeout)
    }
    if (typeof onRejected !== 'function') {
      return rawLock(process, timeout, function (data) {
        onFulfilled(null, data)
      }, onFulfilled)
    }

    rawLock(process, timeout, onFulfilled, onRejected)
  }
  flexLock.syncWrap = function (syncProcess, onError) {
    return function () {
      const args = arguments
      flexLock(function (unlock) {
        syncProcess.apply(null, args)
        unlock()
      }, 0, noop, onError || onSyncError)
    }
  }
  flexLock.sync = function (syncProcess, timeout, onFulfilled, onRejected) {
    return flexLock(function (unlock) {
      let result
      try {
        result = syncProcess()
      } catch (err) {
        return unlock(err)
      }
      unlock(null, result)
    }, timeout, onFulfilled, onRejected)
  }
  flexLock.cb = flexLock
  flexLock.released = rawLock.released
  return flexLock
}
