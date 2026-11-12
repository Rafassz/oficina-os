import { JwtAuthMiddleware } from '../../../../utils'
import { MongoUsuarioRepository } from '../../repositories'
import { CreateUsuarioController } from './Controller'
import { CreateUsuarioUseCase } from './UseCase'

export const setupCreateUsuarioController = () => {
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const createUsuarioUseCase = new CreateUsuarioUseCase({ repository: { usuarioRepository } })

  return new CreateUsuarioController({ useCase: { authVerifyUseCase, createUsuarioUseCase } })
}
