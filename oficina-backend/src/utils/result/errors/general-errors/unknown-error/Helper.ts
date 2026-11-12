import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data?: { error?: any; extraInfo?: any }): IResultError<IErrorType> => {
  return {
    type: 'UnknownError',
    message: 'Ocorreu um erro desconhecido',
    error: data?.error,
    extraInfo: data?.extraInfo,
  }
}
