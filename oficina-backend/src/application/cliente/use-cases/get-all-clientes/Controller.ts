import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetAllClientesUseCase } from './UseCase'

export class GetAllClientesController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getAllClientesUseCase: IGetAllClientesUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getAllClientesUseCase: IGetAllClientesUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getAllClientesUseCase = props.useCase.getAllClientesUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getAllClientesUseCase.execute({
        busca: request.query.busca as string | undefined,
        pagina: request.query.pagina as string | undefined,
        porPagina: request.query.porPagina as string | undefined,
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
