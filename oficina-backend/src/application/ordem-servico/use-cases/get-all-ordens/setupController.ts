import { JwtAuthMiddleware } from '../../../../utils'
import { MongoOrdemServicoRepository } from '../../repositories'
import { MongoVeiculoRepository } from '../../../veiculo/repositories'
import { MongoClienteRepository } from '../../../cliente/repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetAllOrdensController } from './Controller'
import { GetAllOrdensUseCase } from './UseCase'

export const setupGetAllOrdensController = () => {
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const veiculoRepository = new MongoVeiculoRepository()
  const clienteRepository = new MongoClienteRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getAllOrdensUseCase = new GetAllOrdensUseCase({ repository: { ordemServicoRepository, veiculoRepository, clienteRepository } })

  return new GetAllOrdensController({ useCase: { authVerifyUseCase, getAllOrdensUseCase } })
}
