import { JwtAuthMiddleware } from '../../../../utils'
import { MongoOrdemServicoRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetOrdemByIdController } from './Controller'
import { GetOrdemByIdUseCase } from './UseCase'

export const setupGetOrdemByIdController = () => {
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getOrdemByIdUseCase = new GetOrdemByIdUseCase({ repository: { ordemServicoRepository } })

  return new GetOrdemByIdController({ useCase: { authVerifyUseCase, getOrdemByIdUseCase } })
}
