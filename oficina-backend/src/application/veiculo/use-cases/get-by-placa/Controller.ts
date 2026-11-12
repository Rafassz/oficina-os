import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetVeiculosByPlacaUseCase } from './UseCase'

export class GetVeiculosByPlacaController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getVeiculosByPlacaUseCase: IGetVeiculosByPlacaUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getVeiculosByPlacaUseCase: IGetVeiculosByPlacaUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getVeiculosByPlacaUseCase = props.useCase.getVeiculosByPlacaUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getVeiculosByPlacaUseCase.execute({ placa: request.query.placa as string | undefined })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
