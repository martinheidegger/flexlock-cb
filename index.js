'use strict'
const createRawLock = require('./lib/rawLock.js')
const flexApi = require('./lib/flexApi.js')

exports.createLockCb = function (onEveryRelease) {
  return flexApi(createRawLock(onEveryRelease))
}
