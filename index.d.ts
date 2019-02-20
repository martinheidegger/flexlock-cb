type unlock = () => void
type callback <T> = (error?: Error, data?: T) => void
type process<T> = (unlock: callback<T>) => void
type syncProcess<Args> = (...Args) => void
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
  syncWrap <Args> (process: syncProcess<Args>): syncProcess<Args>
  sync <Args> (process: syncProcess<Args>): void

  cb: FlexLockCb
}

export interface CreateLockCb {
  (onEveryRelease?: () => void): FlexLockCb
}

export declare const createLockCb: CreateLockCb
