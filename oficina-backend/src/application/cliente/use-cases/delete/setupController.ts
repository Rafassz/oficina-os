import { JwtAuthMiddleware } from '../../../../utils'
import { MongoClienteRepository } from '../../repositories'
import { MongoVeiculoRepository } from '../../../veiculo/repositories'
import { MongoOrdemServicoRepository } from '../../../ordem-servico/repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { DeleteClienteController } from './Controller'
import { DeleteClienteUseCase } from './UseCase'

export const setupDeleteClienteController = () => {
  const clienteRepository = new MongoClienteRepository()
  const veiculoRepository = new MongoVeiculoRepository()
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const deleteClienteUseCase = new DeleteClienteUseCase({ repository: { clienteRepository, veiculoRepository, ordemServicoRepository } })

  return new DeleteClienteController({ useCase: { authVerifyUseCase, deleteClienteUseCase } })
}
