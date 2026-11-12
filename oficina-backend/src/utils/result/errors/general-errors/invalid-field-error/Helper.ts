import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data: { key: string; message?: string }): IResultError<IErrorType> => {
  return {
    type: 'InvalidFieldError',
    message: data.message ?? `O campo ${data.key} é inválido.`,
    error: data.message ?? `O campo ${data.key} é inválido.`,
    extraInfo: { key: data.key },
  }
}
