import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { LoginController } from './Controller'
import { LoginUseCase } from './UseCase'

export const setupLoginController = () => {
  const usuarioRepository = new MongoUsuarioRepository()

  const loginUseCase = new LoginUseCase({ repository: { usuarioRepository } })

  return new LoginController({ useCase: { loginUseCase } })
}
