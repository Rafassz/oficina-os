export class Result<T, E> {
  public isSuccess: boolean
  public isFailure: boolean
  public error?: E
  private _value?: T

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: um resultado de sucesso não pode conter erro')
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: um resultado com falha precisa de um erro')
    }

    this.isSuccess = isSuccess
    this.isFailure = !isSuccess
    this.error = error
    this._value = value

    Object.freeze(this)
  }

  public getValue(): T | undefined {
    if (this.isFailure) {
      throw new Error('Não é possível recuperar o valor de um resultado com falha.')
    }
    return this._value
  }

  public static ok<U, E>(value?: U): Result<U, E> {
    return new Result<U, E>(true, undefined, value)
  }

  public static fail<U, E>(error: E): Result<U, E> {
    return new Result<U, E>(false, error)
  }
}
