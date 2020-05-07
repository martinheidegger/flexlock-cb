type callback<Result> = (error?: Error, data?: Result) => void
type process<Result> = (unlock: callback<Result>) => void
type resolve<Result> = (result: Result) => void
type reject = (error: Error) => void
type timeout = number

export type Unlock<Result> = callback<Result>

export type Callbacks <T> =
  [callback<T>] |
  [resolve<T>, reject]

export type CallbacksWithTimeout <T> =
  [callback<T>] |
  [callback<T>, timeout] |
  [timeout, callback<T>] |
  [resolve<T>, reject] |
  [resolve<T>, reject, timeout] |
  [timeout, resolve<T>, reject]

export interface FlexLockCbCore {
  <Result> (process: process<Result>, timeout?: timeout): Promise<Result>
  <Result> (process: process<Result>, ...cb: CallbacksWithTimeout<Result>): void
}

export interface IState {
  destroyed: Error | null
}

export interface FlexLockCb extends FlexLockCbCore {
  released(): Promise<IState>
  released(onRelease: callback<IState>): void

  syncWrap <Fn extends (...args) => any> (process: Fn, timeout?: timeout, onError?: (error: Error) => any): (...args: Parameters<Fn>) => void
  syncWrap <Fn extends (...args) => any> (process: Fn, onError?: (error: Error) => any, timeout?: timeout): (...args: Parameters<Fn>) => void

  sync <Args extends Array<any>, Result> (process: (lock: this) => Result, timeout?: timeout): Promise<Result>
  sync <Args extends Array<any>, Result> (process: (lock: this) => Result, ...cb: CallbacksWithTimeout<Result>): void

  destroy (error?: Error): Promise<IState>
  destroy (error: Error, onDestroyed: callback<IState>): void
  destroy (onDestroyed: callback<IState>): void

  cb: FlexLockCb
}

export interface CreateLockCb {
  (onEveryRelease?: () => void, onSyncError?: (err: Error) => void): FlexLockCb
}

export declare const createLockCb: CreateLockCb
