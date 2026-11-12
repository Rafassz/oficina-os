import { JwtAuthMiddleware } from '../../../../utils'
import { MongoOrdemServicoRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { MudarStatusOrdemController } from './Controller'
import { MudarStatusOrdemUseCase } from './UseCase'

export const setupMudarStatusOrdemController = () => {
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const mudarStatusOrdemUseCase = new MudarStatusOrdemUseCase({ repository: { ordemServicoRepository } })

  return new MudarStatusOrdemController({ useCase: { authVerifyUseCase, mudarStatusOrdemUseCase } })
}
