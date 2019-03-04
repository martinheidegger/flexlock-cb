'use strict'
const createRawLock = require('./lib/rawLock.js')
const flexApi = require('./lib/flexApi.js')

exports.createLockCb = function createLockCb (onEveryRelease, onSyncError) {
  return flexApi(createRawLock(onEveryRelease), onSyncError)
}
