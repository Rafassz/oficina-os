export interface IResultError<T> {
  type: T
  message: string
  error?: any
  extraInfo?: any
}
