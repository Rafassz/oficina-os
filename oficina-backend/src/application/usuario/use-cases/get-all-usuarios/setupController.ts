import { JwtAuthMiddleware } from '../../../../utils'
import { MongoUsuarioRepository } from '../../repositories'
import { GetAllUsuariosController } from './Controller'
import { GetAllUsuariosUseCase } from './UseCase'

export const setupGetAllUsuariosController = () => {
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getAllUsuariosUseCase = new GetAllUsuariosUseCase({ repository: { usuarioRepository } })

  return new GetAllUsuariosController({ useCase: { authVerifyUseCase, getAllUsuariosUseCase } })
}
