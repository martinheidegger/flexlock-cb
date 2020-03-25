# flexlock-cb

[![Build Status][cistatus-img]][cistatus-lnk]
[![JavaScript Style Guide][js-style-img]](https://standardjs.com)
[![Maintainability][maintain-img]][maintain-lnk]
[![Test Coverage][coverage-img]][coverage-lnk]

[cistatus-lnk]: https://travis-ci.org/martinheidegger/flexlock-cb
[cistatus-img]: https://travis-ci.org/martinheidegger/flexlock-cb.svg?branch=master
[js-style-img]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[maintain-img]: https://api.codeclimate.com/v1/badges/0515ec5a0831b36b5992/maintainability
[maintain-lnk]: https://codeclimate.com/github/martinheidegger/flexlock-cb/maintainability
[coverage-img]: https://api.codeclimate.com/v1/badges/0515ec5a0831b36b5992/test_coverage
[coverage-lnk]: https://codeclimate.com/github/martinheidegger/flexlock-cb/test_coverage

`flexlock-cb` is a **very small**, **memory-concious**, **flexible** locking library without
dependencies but with `typescript` definitions (see in the bottom). Optimized even further than
[`flexlock`][flexlock] for the use with callbacks instead of promises.

`npm i flexlock-cb --save`

It is similar to other in-memory locking library like [`mutexify`][mutexify],
[`mutex-js`][mutex-js], [`await-lock`][await-lock], and [many more](many-more),
but with more flexibility in how to use it.

This makes it sturdier and more practical in many cases.

[flexlock]: https://github.com/martinheidegger/flexlock
[mutexify]: https://github.com/mafintosh/mutexify
[mutex-js]: https://github.com/danielglennross/mutex-js
[await-lock]: https://www.npmjs.com/package/await-lock
[many-more]: https://www.npmjs.com/search?q=promise+lock

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

const result = await lock.sync(() => {
  // no unlock function (automatically unlocked after method is done)
  return 123
})

result === 123 // the result is passed to the callback
```

Its also possible to wrap a method into a sync lock:

```javascript
const fn = lock.syncWrap((foo, bar) => {
  /**
   - No unlock function.
   - Arguments are passed-through.
   - Executed will be asynchronously.
   - Return value will be ignored.
   */
  foo === 'hello'
  bar === 'world'
})
fn('hello', 'world')
```

Be aware that any errors that might occur will by-default result in uncaught
exceptions!

You can handle those errors by passing an error handler when creating the lock:

```javascript
const lock = createLockCb(null, err => {
  // Here you can handle any error, for example: emit('error', err)
})
const fn = lock.syncWrap(() => {
  throw new Error('error')
})
```

... or by adding a error handler directly when wrapping:

```javascript
const fn2 = lock.syncWrap(() => {
  throw new Error('error')
}, err => {
  // Handle an error thrown in the sync-wrap
})
```

### Typescript recommendation

Figuring out the proper typing was quite tricky for flexlock-cb.
To make things easier for users, it exports a `Callbacks` type that
can be used to reduce  

```typescript
import { Callbacks, createLockCb } from 'flexlock-cb'

const lock = createLockCb()

//
// Overloading for the two use cases (return type void or Promise)
// If you would like to improve this, vote for
// https://github.com/Microsoft/TypeScript/issues/29182
//
function fn (foo: string, bar: number, ...cb: Callbacks<string>): void
function fn (foo: string, bar: number): Promise<string>
function fn (foo: string, bar: number, ...cb) {
  return lock(() => `${foo} ${bar}`, 0, ...cb)
}

// Separate definitions with the support for timeouts
import { CallbacksWithTimeout } from 'flexlock-cb'

function fnTime (foo: string, bar: number, ...cb: CallbacksWithTimeout<string>): void
function fnTime (foo: string, bar: number, timeout?: number): Promise<string>
function fnTime (foo: string, bar: number, ...cb) {
  return lock(() => `${foo} ${bar}`, ...cb)
}
```

### License

[MIT](./LICENSE)
