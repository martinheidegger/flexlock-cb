# flexlock-cb

<a href="https://travis-ci.org/martinheidegger/flexlock-cb"><img src="https://travis-ci.org/martinheidegger/flexlock-cb.svg?branch=master" alt="Build Status"/></a>
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintainability](https://api.codeclimate.com/v1/badges/0515ec5a0831b36b5992/maintainability)](https://codeclimate.com/github/martinheidegger/flexlock-cb/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0515ec5a0831b36b5992/test_coverage)](https://codeclimate.com/github/martinheidegger/flexlock-cb/test_coverage)

`flexlock-cb` is a **very small**, **memory-concious**, **flexible** locking library without
dependencies but with `typescript` definitions. Optimized even further than [`flexlock`](https://github.com/martinheidegger/flexlock) for the use with callbacks instead of promises.

`npm i flexlock-cb --save`

It is similar to other in-memory locking library like [`mutexify`](https://github.com/mafintosh/mutexify), [`mutex-js`](https://github.com/danielglennross/mutex-js), [`await-lock`](https://www.npmjs.com/package/await-lock), and [many more](https://www.npmjs.com/search?q=promise+lock), but with more flexibility in how
to use it. This makes it sturdier and more practical in many cases.


### _simple_ basic API

```javascript
const createLock = require('flexlock-cb').createLockCb

const lock = createLock()

lock(unlock => {
  // done before the next block
  unlock()
})
lock(unlock => {
  // will wait for the 
  unlock()
})
```

### _Propagation_ of errors and results to a callback

```javascript
function callback (err, data) {
  // err === null
  // data === 'important'
}

lock(
  unlock => unlock(null, 'important'),
  callback
)
```

### _Promises_ are returned if no callback is added

```javascript
const promise = lock(unlock => {
  unlock(null, 'important')
}) // Without passing in a callback, promises will be created

promise
  .catch(err => {})
  .then(data => {})
  // This way you can support both callback and promise based APIs
```

### _Timeouts_ in case anther lock never returns

```javascript
function neverUnlock (unlock) { /* Due to a bug it never unlocks */ }
function neverCalled () {}

lock(neverUnlock)
lock(neverCalled, 500, err => {
  err.code === 'ETIMEOUT'
})
```

### _release_ handlers both once and for every release

```javascript
function onEveryRelease () {}
function onNextRelease () {}

const lock = createLock(onEveryRelease) // Called everytime the lock is released
lock.released(onNextRelease) // Called next time the lock is released

await lock.released() // Promise API available as well
```

### Like for Promises, two separate callbacks can be specified

```javascript
function onSuccess (data) {}
function onError (err) {}

lock(unlock => unlock(), onSucess, onError)
```

### _sync_ handlers, for when you want to make sure that other locks are done

```javascript
const lock = createLock()

lock.sync(() => {
  // no unlock function (automatically unlocked after method is done)
})

const fn = lock.syncWrap((foo, bar) => {
  // no unlock function, arguments are passed-through
})
fn('hello', 'world')
```

### License

[MIT](./LICENSE)
