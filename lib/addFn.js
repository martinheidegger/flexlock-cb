'use strict'
module.exports = function addFn (callbacks, callback) {
  if (callbacks === undefined) {
    return callback
  }
  if (typeof callbacks === 'function') {
    return [callbacks, callback]
  }
  callbacks.push(callback)
  return callbacks
}
