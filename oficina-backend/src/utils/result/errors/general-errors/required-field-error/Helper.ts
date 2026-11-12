import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data: { key: string }): IResultError<IErrorType> => {
  return {
    type: 'RequiredFieldError',
    message: `O campo ${data.key} é obrigatório.`,
    error: `O campo ${data.key} é obrigatório.`,
    extraInfo: { key: data.key },
  }
}
