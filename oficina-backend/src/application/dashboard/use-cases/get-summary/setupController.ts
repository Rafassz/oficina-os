import { JwtAuthMiddleware } from '../../../../utils'
import { MongoOrdemServicoRepository } from '../../../ordem-servico/repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetDashboardSummaryController } from './Controller'
import { GetDashboardSummaryUseCase } from './UseCase'

export const setupGetDashboardSummaryController = () => {
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase({ repository: { ordemServicoRepository } })

  return new GetDashboardSummaryController({ useCase: { authVerifyUseCase, getDashboardSummaryUseCase } })
}
