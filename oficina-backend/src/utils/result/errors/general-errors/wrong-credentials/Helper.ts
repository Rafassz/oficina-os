import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data?: { message?: string; extraInfo?: any }): IResultError<IErrorType> => {
  return {
    type: 'WrongCredentials',
    message: data?.message ?? 'Não autorizado',
    error: data?.message ?? 'Não autorizado',
    extraInfo: data?.extraInfo,
  }
}
