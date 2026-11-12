import { Response } from 'express'
import { IResultError } from '../result'

// Tradução do tipo de erro do UseCase para status HTTP — a mesma em todos os controllers
const STATUS_POR_ERRO: Record<string, number> = {
  RequiredFieldError: 400,
  InvalidFieldError: 400,
  WrongCredentials: 401,
  NotFoundError: 404,
  NotAcceptableError: 406,
  UniqueKeyDuplicateError: 409,
  DataBaseError: 500,
  UnknownError: 500,
}

export const statusDoErro = (erro?: IResultError<any>) => (erro && STATUS_POR_ERRO[erro.type]) ?? 500

export const respostaErro = (response: Response, erro?: IResultError<any>) => {
  const status = statusDoErro(erro)
  // detalhes internos (stack, erro do driver) não vão para o cliente
  if (status >= 500) {
    return response.status(status).json({ type: erro?.type ?? 'UnknownError', message: erro?.message ?? 'Erro inesperado' })
  }
  return response.status(status).json({ type: erro!.type, message: erro!.message, extraInfo: erro!.extraInfo })
}
