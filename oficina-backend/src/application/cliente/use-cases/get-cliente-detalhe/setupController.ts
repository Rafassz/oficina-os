import { JwtAuthMiddleware } from '../../../../utils'
import { MongoClienteRepository } from '../../repositories'
import { MongoVeiculoRepository } from '../../../veiculo/repositories'
import { MongoOrdemServicoRepository } from '../../../ordem-servico/repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetClienteDetalheController } from './Controller'
import { GetClienteDetalheUseCase } from './UseCase'

export const setupGetClienteDetalheController = () => {
  const clienteRepository = new MongoClienteRepository()
  const veiculoRepository = new MongoVeiculoRepository()
  const ordemServicoRepository = new MongoOrdemServicoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getClienteDetalheUseCase = new GetClienteDetalheUseCase({ repository: { clienteRepository, veiculoRepository, ordemServicoRepository } })

  return new GetClienteDetalheController({ useCase: { authVerifyUseCase, getClienteDetalheUseCase } })
}
