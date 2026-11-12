import { JwtAuthMiddleware } from '../../../../utils'
import { MongoClienteRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { UpdateClienteController } from './Controller'
import { UpdateClienteUseCase } from './UseCase'

export const setupUpdateClienteController = () => {
  const clienteRepository = new MongoClienteRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const updateClienteUseCase = new UpdateClienteUseCase({ repository: { clienteRepository } })

  return new UpdateClienteController({ useCase: { authVerifyUseCase, updateClienteUseCase } })
}
