import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { ICreateClienteUseCase } from './UseCase'

export class CreateClienteController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _createClienteUseCase: ICreateClienteUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; createClienteUseCase: ICreateClienteUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._createClienteUseCase = props.useCase.createClienteUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._createClienteUseCase.execute({
        nome: request.body?.nome,
        telefone: request.body?.telefone,
        documento: request.body?.documento,
        email: request.body?.email,
        observacoes: request.body?.observacoes,
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(201).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
