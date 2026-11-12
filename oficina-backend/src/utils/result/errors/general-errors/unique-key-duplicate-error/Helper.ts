import { IResultError } from '../../result-error'
import { IErrorType } from './IErrorType'

export const Helper = (data: { key: string; value?: any }): IResultError<IErrorType> => {
  return {
    type: 'UniqueKeyDuplicateError',
    message: `Já existe um cadastro com esse(a) ${data.key}.`,
    error: `Já existe um cadastro com esse(a) ${data.key}.`,
    extraInfo: { key: data.key, value: data.value },
  }
}
