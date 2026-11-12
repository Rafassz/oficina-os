import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data?: { error?: any }): IResultError<IErrorType> => {
  return {
    type: 'DataBaseError',
    message: 'Ocorreu um erro ao acessar o banco de dados',
    error: data?.error,
  }
}
