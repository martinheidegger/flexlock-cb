'use strict'
module.exports = function once (fn) {
  let called = false
  return function (err, data) {
    if (called === true) return
    called = true
    fn(err, data)
  }
}
