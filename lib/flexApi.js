'use strict'
function toPromise (rawLock, process, timeout) {
  return new Promise(rawLock.bind(null, process, timeout))
}

module.exports = function (rawLock) {
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
  flexLock.cb = flexLock
  flexLock.released = rawLock.released
  return flexLock
}
