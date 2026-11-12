import { JwtAuthMiddleware } from '../../../../utils'
import { MongoOrdemServicoRepository } from '../../repositories'
import { MongoVeiculoRepository } from '../../../veiculo/repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { CreateOrdemController } from './Controller'
import { CreateOrdemUseCase } from './UseCase'

export const setupCreateOrdemController = () => {
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const veiculoRepository = new MongoVeiculoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const createOrdemUseCase = new CreateOrdemUseCase({ repository: { ordemServicoRepository, veiculoRepository, usuarioRepository } })

  return new CreateOrdemController({ useCase: { authVerifyUseCase, createOrdemUseCase } })
}
