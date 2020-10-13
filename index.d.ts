type callback<Result> = (error: Error | null, data?: Result) => void
type process<Result> = (unlock: callback<Result>) => void
type resolve<Result> = (result: Result) => void
type reject = (error: Error) => void
type timeout = number

export type Unlock<Result> = callback<Result>

export type Callbacks <T> =
  [callback: callback<T>] |
  [resolve: resolve<T>, reject: reject]

export type CallbacksWithTimeout <T> =
  Callbacks<T> |
  [callback: callback<T>, timeout: timeout] |
  [timeout: timeout, callback: callback<T>] |
  [resolve: resolve<T>, reject: reject, timeout: timeout] |
  [timeout: timeout, resolve: resolve<T>, reject: reject]

export interface FlexLockCbCore {
  <Result> (process: process<Result>, ...cb: CallbacksWithTimeout<Result>): void
  <Result> (process: process<Result>, timeout?: timeout): Promise<Result>
}

export interface IState {
  destroyed: Error | null
}

export interface FlexLockCb extends FlexLockCbCore {
  released(): Promise<IState>
  released(onRelease: callback<IState>): void

  syncWrap <Fn extends (...args) => any> (process: Fn, timeout?: timeout, onError?: (error: Error) => any): (...args: Parameters<Fn>) => void
  syncWrap <Fn extends (...args) => any> (process: Fn, onError?: (error: Error) => any, timeout?: timeout): (...args: Parameters<Fn>) => void

  sync <Result> (process: (lock: this) => Result, timeout?: timeout): Promise<Result>
  sync <Result> (process: (lock: this) => Result, ...cb: CallbacksWithTimeout<Result>): void

  destroy (error?: Error): Promise<IState>
  destroy (error: Error, onDestroyed: callback<IState>): void
  destroy (onDestroyed: callback<IState>): void

  cb: FlexLockCb
}

export interface CreateLockCb {
  (onEveryRelease?: () => void, onSyncError?: (err: Error) => void): FlexLockCb
}

export declare const createLockCb: CreateLockCb
