import { Request, Response } from 'express'
import { IController, JwtAuthMiddleware, respostaErro } from '../../../../utils'
import { IGetDashboardSummaryUseCase } from './UseCase'

export class GetDashboardSummaryController implements IController {
  // Auth
  private readonly _authVerifyUseCase: JwtAuthMiddleware
  // Use Case
  private readonly _getDashboardSummaryUseCase: IGetDashboardSummaryUseCase

  constructor(props: { useCase: { authVerifyUseCase: JwtAuthMiddleware; getDashboardSummaryUseCase: IGetDashboardSummaryUseCase } }) {
    this._authVerifyUseCase = props.useCase.authVerifyUseCase
    this._getDashboardSummaryUseCase = props.useCase.getDashboardSummaryUseCase
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const authVerify = await this._authVerifyUseCase.execute(request)
      if (authVerify.isFailure) return respostaErro(response, authVerify.error)

      const result = await this._getDashboardSummaryUseCase.execute({ agora: new Date() })

      if (result.isFailure) return respostaErro(response, result.error)
      return response.status(200).json(result.getValue())
    } catch (error: any) {
      return response.status(400).json({ message: error.message || 'Erro inesperado' })
    }
  }
}
