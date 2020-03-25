# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/martinheidegger/flexlock-cb/compare/v2.0.2...v2.1.0) (2020-03-25)


### Features

* **sync-wrap:** added flexlock reference to be used in sync operation ([8e10399](https://github.com/martinheidegger/flexlock-cb/commit/8e10399f54422e7dd159fd54c3d86fda72da25ef))
* **sync-wrap:** Added timeout support ([16a3e69](https://github.com/martinheidegger/flexlock-cb/commit/16a3e69694d9ef548cce98a715abd8c473fe1d2f))
* **types:** Improved type declarations and added section on typescript information ([84b0d53](https://github.com/martinheidegger/flexlock-cb/commit/84b0d537d7b2d5a338801cc84f62005c61e21f46))


### Bug Fixes

* **docs:** Extracted links to footnote ([5e9fa8b](https://github.com/martinheidegger/flexlock-cb/commit/5e9fa8bbd0af88e7f266ec10c3a30d4d81551030))
* **docs:** Used createLockCb function signature consistently ([a746401](https://github.com/martinheidegger/flexlock-cb/commit/a746401818f8e2936015572e587ae285fe746e26))
* **test:** Fixing coverage for node > 4 ([b165554](https://github.com/martinheidegger/flexlock-cb/commit/b1655548bdc9a37ece8801d83e041304ab12044f))

### [2.0.2](https://github.com/martinheidegger/flexlock-cb/compare/v2.0.1...v2.0.2) (2020-03-24)

## [2.0.1](https://github.com/martinheidegger/flexlock-cb/compare/v2.0.0...v2.0.1) (2019-04-13)


### Bug Fixes

* data is passed to rejected-handler in case an error happens ([67f0010](https://github.com/martinheidegger/flexlock-cb/commit/67f0010))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [2.0.0](https://github.com/martinheidegger/flexlock-cb/compare/v1.2.0...v2.0.0) (2019-03-05)


### Features

* handling sync calls like regular calls, with supports for callbacks and error handling. ([520f08a](https://github.com/martinheidegger/flexlock-cb/commit/520f08a))


### Performance Improvements

* improving callback performance while maintaining async behavior. ([59ef312](https://github.com/martinheidegger/flexlock-cb/commit/59ef312))


### BREAKING CHANGES

* this shouldn’t break any common cases, but as the performance is quicker, it might break things that rely on that.
* The sync api expected errors to be sent to the onSyncError handler. This is not happening anymore which makes this a breaking change.



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [1.2.0](https://github.com/martinheidegger/flexlock-cb/compare/v1.1.0...v1.2.0) (2019-03-04)


### Features

* handler for sync errors ([049650f](https://github.com/martinheidegger/flexlock-cb/commit/049650f))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 1.1.0 (2019-02-20)


### Bug Fixes

* correctly supporting a simple callback. ([908d083](https://github.com/martinheidegger/flexlock-cb/commit/908d083))
* typescript definitions: .cb also has released fields. ([4d43897](https://github.com/martinheidegger/flexlock-cb/commit/4d43897))


### Features

* added sync and syncWrap methods to easily run direct calls on the lock ([2d5e764](https://github.com/martinheidegger/flexlock-cb/commit/2d5e764))
