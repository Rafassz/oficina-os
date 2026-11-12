import { JwtAuthMiddleware } from '../../../../utils'
import { MongoClienteRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { CreateClienteController } from './Controller'
import { CreateClienteUseCase } from './UseCase'

export const setupCreateClienteController = () => {
  const clienteRepository = new MongoClienteRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const createClienteUseCase = new CreateClienteUseCase({ repository: { clienteRepository } })

  return new CreateClienteController({ useCase: { authVerifyUseCase, createClienteUseCase } })
}
