import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro, tokenDoHeader } from '../../../../utils'
import { IMudarStatusOrdemUseCase } from './UseCase'

export class MudarStatusOrdemController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _mudarStatusOrdemUseCase: IMudarStatusOrdemUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; mudarStatusOrdemUseCase: IMudarStatusOrdemUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._mudarStatusOrdemUseCase = props.useCase.mudarStatusOrdemUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._mudarStatusOrdemUseCase.execute({
        IdOrdemServico: String(request.params.IdOrdemServico),
        status: request.body?.status,
        obs: request.body?.obs,
        token: tokenDoHeader(request.headers.authorization),
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
