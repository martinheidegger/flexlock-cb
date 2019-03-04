type unlock = () => void
type callback <T> = (error?: Error, data?: T) => void
type process<T> = (unlock: callback<T>) => void
type syncProcess<Args, Result = void> = (...Args) => Result
type resolve<T> = (result: T) => void
type reject = (error: Error) => void

export interface FlexLockCbCore {
  <T> (process: process<T>): Promise<T>
  <T> (process: process<T>, callback: callback<T>): void
  <T> (process: process<T>, timeout: number): Promise<T>
  <T> (process: process<T>, timeout: number, callback: null | undefined): Promise<T>
  <T> (process: process<T>, timeout: number, callback: callback<T>): void
  <T> (process: process<T>, callback: callback<T>, timeout: number): void
  <T> (process: process<T>, resolve: resolve<T>, reject: reject, timeout: number): void
  <T> (process: process<T>, timeout: number, resolve: resolve<T>, reject: reject): void
}

export interface FlexLockCb extends FlexLockCbCore {
  released(): Promise<void>
  released(onRelease: () => void): void
  syncWrap <Args, Result> (process: syncProcess<Args, Result>, onSyncError?: reject): syncProcess<Args, void>
  sync <Args, Result> (process: syncProcess<Args, Result>): Promise<Result>
  sync <Args, Result> (process: syncProcess<Args, Result>, callback: callback<Result>): void
  sync <Args, Result> (process: syncProcess<Args, Result>, timeout: number): Promise<Result>
  sync <Args, Result> (process: syncProcess<Args, Result>, timeout: number, callback: callback<Result>): void
  sync <Args, Result> (process: syncProcess<Args, Result>, resolve: resolve<Result>, reject: reject, timeout: number): void
  sync <Args, Result> (process: syncProcess<Args, Result>, timeout: number, resolve: resolve<Result>, reject: reject): void

  cb: FlexLockCb
}

export interface CreateLockCb {
  (onEveryRelease?: () => void, onSyncError?: (err: Error) => void): FlexLockCb
}

export declare const createLockCb: CreateLockCb
