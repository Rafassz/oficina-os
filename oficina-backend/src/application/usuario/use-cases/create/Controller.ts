import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro, tokenDoHeader } from '../../../../utils'
import { ICreateUsuarioUseCase } from './UseCase'

export class CreateUsuarioController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _createUsuarioUseCase: ICreateUsuarioUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; createUsuarioUseCase: ICreateUsuarioUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._createUsuarioUseCase = props.useCase.createUsuarioUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._createUsuarioUseCase.execute({
        nome: request.body?.nome,
        email: request.body?.email,
        senha: request.body?.senha,
        papel: request.body?.papel,
        token: tokenDoHeader(request.headers.authorization),
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(201).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
