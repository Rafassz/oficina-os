import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetAllOrdensUseCase } from './UseCase'

export class GetAllOrdensController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getAllOrdensUseCase: IGetAllOrdensUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getAllOrdensUseCase: IGetAllOrdensUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getAllOrdensUseCase = props.useCase.getAllOrdensUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getAllOrdensUseCase.execute({
        status: request.query.status as string | undefined,
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
