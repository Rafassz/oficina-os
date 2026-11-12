import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IUpdateVeiculoUseCase } from './UseCase'

export class UpdateVeiculoController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _updateVeiculoUseCase: IUpdateVeiculoUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; updateVeiculoUseCase: IUpdateVeiculoUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._updateVeiculoUseCase = props.useCase.updateVeiculoUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._updateVeiculoUseCase.execute({
        IdVeiculo: String(request.params.IdVeiculo),
        placa: request.body?.placa,
        marca: request.body?.marca,
        modelo: request.body?.modelo,
        ano: request.body?.ano,
        cor: request.body?.cor,
        km: request.body?.km,
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
