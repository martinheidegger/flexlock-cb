'use strict'
const createReleaseMgr = require('./releaseMgr.js')
const once = require('./once.js')
const timeoutFn = require('./timeoutFn.js')
const addFn = require('./addFn.js')

function createCallback (unlock, onFulfilled, onRejected) {
  return once(function (err, data) {
    if (err) {
      onRejected(err)
    } else {
      onFulfilled(data)
    }
    unlock()
  })
}

module.exports = function createRawLock (onEveryRelease) {
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

  function _rawLock (process, onFulfilled, onRejected) {
    released = false
    const cb = createCallback(unlock, onFulfilled, onRejected)
    setImmediate(function () {
      try {
        process(cb)
      } catch (err) {
        cb(err)
      }
    })
  }

  function rawLock (process, timeout, onFulfilled, onRejected) {
    if (typeof timeout === 'number' && timeout > 0) {
      process = timeoutFn(timeout, process, onRejected)
    }
    if (released === false) {
      queue = addFn(queue, _rawLock.bind(null, process, onFulfilled, onRejected))
      return
    }
    _rawLock(process, onFulfilled, onRejected)
    if (typeof onEveryRelease === 'function') {
      releaseMgr.initSession()
    }
  }

  rawLock.released = function (onRelease) {
    if (releaseMgr === undefined) {
      releaseMgr = createReleaseMgr(isReleased, onEveryRelease)
    }
    return releaseMgr.released(onRelease)
  }
  return rawLock
}
