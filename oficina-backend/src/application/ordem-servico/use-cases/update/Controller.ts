import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IUpdateOrdemUseCase } from './UseCase'

export class UpdateOrdemController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _updateOrdemUseCase: IUpdateOrdemUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; updateOrdemUseCase: IUpdateOrdemUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._updateOrdemUseCase = props.useCase.updateOrdemUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._updateOrdemUseCase.execute({
        IdOrdemServico: String(request.params.IdOrdemServico),
        relato: request.body?.relato,
        diagnostico: request.body?.diagnostico,
        itens: request.body?.itens,
        desconto: request.body?.desconto,
        previsaoEntrega: request.body?.previsaoEntrega,
        IdMecanico: request.body?.mecanico,
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
