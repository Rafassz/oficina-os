import { Request, Response } from 'express'
import { IController, respostaErro } from '../../../../utils'
import { ILoginUseCase } from './UseCase'

export class LoginController implements IController {
  // Use Case
  private readonly _loginUseCase: ILoginUseCase

  constructor(props: { useCase: { loginUseCase: ILoginUseCase } }) {
    this._loginUseCase = props.useCase.loginUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const result = await this._loginUseCase.execute({
        email: request.body?.email,
        senha: request.body?.senha,
      })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
