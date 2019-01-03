'use strict'
function createTimeoutError (timeout) {
  return Object.assign(Error('Timeout[t=' + timeout + ']'), {
    code: 'ETIMEOUT',
    timeout: timeout
  })
}

module.exports = function timeoutFn (timeout, onRegular, onTimeout) {
  let timer = setTimeout(function () {
    timer = null
    onTimeout(createTimeoutError(timeout))
  }, timeout)
  return function (unlockCb) {
    if (timer === null) {
      return
    }
    clearTimeout(timer)
    onRegular(unlockCb)
  }
}
