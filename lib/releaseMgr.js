'use strict'
const addFn = require('./addFn')

function triggerAll (callbacks) {
  if (typeof callbacks === 'function') {
    callbacks()
    return
  }
  for (let i = 0, len = callbacks.length; i < len; i++) {
    const cb = callbacks[i]
    cb()
  }
}

function createSession () {
  let callbacks
  let unlockP

  return {
    trigger: function () {
      triggerAll(callbacks)
    },
    released: function (onRelease) {
      if (typeof onRelease === 'function') {
        callbacks = addFn(callbacks, onRelease)
        return
      }
      if (unlockP === undefined) {
        unlockP = new Promise(function (resolve) {
          callbacks = addFn(callbacks, resolve)
        })
      }
      return unlockP
    }
  }
}

module.exports = function createReleaseMgr (isReleased, onEveryRelease) {
  let session = null

  function trigger () {
    if (session === null) {
      return
    }
    const _session = session
    session = null
    _session.trigger()
  }

  function initSession () {
    if (session === null) {
      const _session = createSession()
      setImmediate(function () {
        if (_session !== session) {
          // This session has already been triggered and a new session exists.
          return
        }
        if (!isReleased()) {
          // This session is not released yet, which means a trigger will come.
          return
        }
        trigger()
      })
      if (typeof onEveryRelease === 'function') {
        _session.released(onEveryRelease)
      }
      session = _session
    }
    return session
  }

  function released (onEmpty) {
    return initSession().released(onEmpty)
  }

  if (typeof onEveryRelease === 'function') {
    initSession()
  }

  return {
    trigger: trigger,
    initSession: initSession,
    released: released
  }
}
