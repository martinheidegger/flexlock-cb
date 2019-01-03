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
const createLock = require('flexlock-cb')

const lock = createLock()

lock(unlock => {
  // done before the next block
  unlock()
})
lock(unlock => {
  // done after the previous block
  unlock()
})
```

### _Timeouts_ in case anther lock never returns

```javascript
lock(unlock => {}) // This never releases the lock
lock(unlock => { /* this will never be called */ }, 500)
  .catch(err => {
    err.code === 'ETIMEOUT'
  })
```

### _Propagation_ of errors and results to a callback

```javascript
lock(unlock => {
  unlock(null, 'important')
}, (err, data) => {
  err === null
  data === 'hello'
  // This way you can simply pass the error or data to a callback
})
```

### Propagation of errors and results to _Promises_

```javascript
lock(unlock => {
  unlock(null, 'important')
}) // Without passing in a callback, promises will be created
  .catch(err => {})
  .then(data => {})
  // This way you can support both callback and promise based APIS
})
```

### _release_ handlers both once and for every release

```javascript
const lock = createLock(() => {
  // called every time all locks are released
})

lock.released(() => {
  // called once, next all locks are released
})

await lock.released() // Promise API available as well
```

### License

MIT
