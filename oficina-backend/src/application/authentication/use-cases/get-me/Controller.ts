import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro, tokenDoHeader } from '../../../../utils'
import { IGetMeUseCase } from './UseCase'

export class GetMeController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getMeUseCase: IGetMeUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getMeUseCase: IGetMeUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getMeUseCase = props.useCase.getMeUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getMeUseCase.execute({ token: tokenDoHeader(request.headers.authorization) })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
