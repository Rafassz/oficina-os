import { JwtAuthMiddleware } from '../../../../utils'
import { MongoOrdemServicoRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { UpdateOrdemController } from './Controller'
import { UpdateOrdemUseCase } from './UseCase'

export const setupUpdateOrdemController = () => {
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const updateOrdemUseCase = new UpdateOrdemUseCase({ repository: { ordemServicoRepository, usuarioRepository } })

  return new UpdateOrdemController({ useCase: { authVerifyUseCase, updateOrdemUseCase } })
}
