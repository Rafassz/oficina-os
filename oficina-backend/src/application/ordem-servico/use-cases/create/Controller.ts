import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro, tokenDoHeader } from '../../../../utils'
import { ICreateOrdemUseCase } from './UseCase'

export class CreateOrdemController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _createOrdemUseCase: ICreateOrdemUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; createOrdemUseCase: ICreateOrdemUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._createOrdemUseCase = props.useCase.createOrdemUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._createOrdemUseCase.execute({
        IdCliente: request.body?.cliente,
        IdVeiculo: request.body?.veiculo,
        IdMecanico: request.body?.mecanico,
        kmEntrada: request.body?.kmEntrada,
        relato: request.body?.relato,
        previsaoEntrega: request.body?.previsaoEntrega,
        token: tokenDoHeader(request.headers.authorization),
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(201).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
