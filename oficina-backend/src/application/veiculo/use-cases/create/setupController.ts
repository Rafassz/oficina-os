import { JwtAuthMiddleware } from '../../../../utils'
import { MongoVeiculoRepository } from '../../repositories'
import { MongoClienteRepository } from '../../../cliente/repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { CreateVeiculoController } from './Controller'
import { CreateVeiculoUseCase } from './UseCase'

export const setupCreateVeiculoController = () => {
  const veiculoRepository = new MongoVeiculoRepository()
  const clienteRepository = new MongoClienteRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const createVeiculoUseCase = new CreateVeiculoUseCase({ repository: { veiculoRepository, clienteRepository } })

  return new CreateVeiculoController({ useCase: { authVerifyUseCase, createVeiculoUseCase } })
}
