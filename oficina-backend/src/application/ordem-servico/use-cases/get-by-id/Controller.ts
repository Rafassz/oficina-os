import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetOrdemByIdUseCase } from './UseCase'

export class GetOrdemByIdController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getOrdemByIdUseCase: IGetOrdemByIdUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getOrdemByIdUseCase: IGetOrdemByIdUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getOrdemByIdUseCase = props.useCase.getOrdemByIdUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getOrdemByIdUseCase.execute({ IdOrdemServico: String(request.params.IdOrdemServico) })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
