import { JwtAuthMiddleware } from '../../../../utils'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetMeController } from './Controller'
import { GetMeUseCase } from './UseCase'

export const setupGetMeController = () => {
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getMeUseCase = new GetMeUseCase({ repository: { usuarioRepository } })

  return new GetMeController({ useCase: { authVerifyUseCase, getMeUseCase } })
}
