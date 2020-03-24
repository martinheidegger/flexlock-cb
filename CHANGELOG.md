# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
