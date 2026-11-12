import { JwtAuthMiddleware } from '../../../../utils'
import { MongoClienteRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetAllClientesController } from './Controller'
import { GetAllClientesUseCase } from './UseCase'

export const setupGetAllClientesController = () => {
  const clienteRepository = new MongoClienteRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getAllClientesUseCase = new GetAllClientesUseCase({ repository: { clienteRepository } })

  return new GetAllClientesController({ useCase: { authVerifyUseCase, getAllClientesUseCase } })
}
