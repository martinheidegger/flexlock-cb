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
  const state = {
    released: true,
    destroyed: null
  }
  let queue
  let releaseMgr

  if (typeof onEveryRelease === 'function') {
    releaseMgr = createReleaseMgr(state, onEveryRelease)
  }

  function unlock () {
    state.released = true
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
    if (state.destroyed !== null) {
      onRejected(state.destroyed)
      unlock()
      return
    }
    const cb = createCallback(unlock, onFulfilled, onRejected)
    try {
      process(cb)
    } catch (err) {
      cb(err)
    }
  }

  function lock (process, timeout, onFulfilled, onRejected) {
    if (timeout > 0) {
      process = timeoutFn(timeout, process, onRejected)
    }
    if (state.released === false) {
      queue = addFn(queue, _lock.bind(null, process, onFulfilled, onRejected))
      return
    }
    state.released = false
    setImmediate(_lock.bind(null, process, onFulfilled, onRejected))
    if (typeof onEveryRelease === 'function') {
      releaseMgr.initSession()
    }
  }

  lock.destroy = function (err, cb) {
    if (typeof err === 'function') {
      return lock.destroy(Object.assign(new Error('Lock destroyed.'), { code: 'E_DESTROYED' }), err)
    }
    if (state.destroyed === null) {
      state.destroyed = err
    }
    return lock.released(cb)
  }

  lock.released = function (onRelease) {
    if (releaseMgr === undefined) {
      releaseMgr = createReleaseMgr(state, onEveryRelease)
    }
    return releaseMgr.released(onRelease)
  }
  return lock
}
