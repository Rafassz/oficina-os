import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetClienteDetalheUseCase } from './UseCase'

export class GetClienteDetalheController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getClienteDetalheUseCase: IGetClienteDetalheUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getClienteDetalheUseCase: IGetClienteDetalheUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getClienteDetalheUseCase = props.useCase.getClienteDetalheUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getClienteDetalheUseCase.execute({ IdCliente: String(request.params.IdCliente) })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
