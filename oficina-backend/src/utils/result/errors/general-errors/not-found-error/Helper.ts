import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data: { key: string }): IResultError<IErrorType> => {
  return {
    type: 'NotFoundError',
    message: `${data.key} não encontrado(a).`,
    error: `${data.key} não encontrado(a).`,
  }
}
