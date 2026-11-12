import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetAllUsuariosUseCase } from './UseCase'

export class GetAllUsuariosController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getAllUsuariosUseCase: IGetAllUsuariosUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getAllUsuariosUseCase: IGetAllUsuariosUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getAllUsuariosUseCase = props.useCase.getAllUsuariosUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getAllUsuariosUseCase.execute({
        papel: request.query.papel as string | undefined,
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
