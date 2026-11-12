import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data: { message: string; extraInfo?: any }): IResultError<IErrorType> => {
  return {
    type: 'NotAcceptableError',
    message: data.message,
    error: data.message,
    extraInfo: data.extraInfo,
  }
}
