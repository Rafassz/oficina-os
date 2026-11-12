import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IDeleteClienteUseCase } from './UseCase'

export class DeleteClienteController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _deleteClienteUseCase: IDeleteClienteUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; deleteClienteUseCase: IDeleteClienteUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._deleteClienteUseCase = props.useCase.deleteClienteUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._deleteClienteUseCase.execute({ IdCliente: String(request.params.IdCliente) })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(204).end()
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
