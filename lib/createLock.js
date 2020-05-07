'use strict'
const createReleaseMgr = require('./releaseMgr.js')
const once = require('./once.js')
const timeoutFn = require('./timeoutFn.js')
const addFn = require('./addFn.js')

function createCallback (unlock, onFulfilled, onRejected) {
  return once(function (err, data) {
    if (err) {
      onRejected(err, data)
    } else {
      onFulfilled(data)
    }
    unlock()
  })
}

module.exports = function createLock (onEveryRelease) {
  let released = true
  let queue
  let releaseMgr

  if (typeof onEveryRelease === 'function') {
    releaseMgr = createReleaseMgr(isReleased, onEveryRelease)
  }

  function isReleased () {
    return released
  }

  function unlock () {
    released = true
    if (queue !== undefined) {
      const resumeProcess = (typeof queue === 'function') ? queue : queue.shift()
      if (resumeProcess === queue) {
        queue = undefined
      }
      if (resumeProcess !== undefined) {
        resumeProcess()
        return
      }
      queue = undefined
    }
    if (releaseMgr !== undefined) {
      releaseMgr.trigger()
    }
  }

  function _lock (process, onFulfilled, onRejected) {
    const cb = createCallback(unlock, onFulfilled, onRejected)
    try {
      process(cb)
    } catch (err) {
      cb(err)
    }
  }

  function lock (process, timeout, onFulfilled, onRejected) {
    if (typeof timeout === 'number' && timeout > 0) {
      process = timeoutFn(timeout, process, onRejected)
    }
    if (released === false) {
      queue = addFn(queue, _lock.bind(null, process, onFulfilled, onRejected))
      return
    }
    released = false
    setImmediate(_lock.bind(null, process, onFulfilled, onRejected))
    if (typeof onEveryRelease === 'function') {
      releaseMgr.initSession()
    }
  }

  lock.released = function (onRelease) {
    if (releaseMgr === undefined) {
      releaseMgr = createReleaseMgr(isReleased, onEveryRelease)
    }
    return releaseMgr.released(onRelease)
  }
  return lock
}
