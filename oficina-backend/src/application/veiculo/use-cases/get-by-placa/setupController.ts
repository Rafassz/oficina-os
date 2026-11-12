import { JwtAuthMiddleware } from '../../../../utils'
import { MongoVeiculoRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { GetVeiculosByPlacaController } from './Controller'
import { GetVeiculosByPlacaUseCase } from './UseCase'

export const setupGetVeiculosByPlacaController = () => {
  const veiculoRepository = new MongoVeiculoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const getVeiculosByPlacaUseCase = new GetVeiculosByPlacaUseCase({ repository: { veiculoRepository } })

  return new GetVeiculosByPlacaController({ useCase: { authVerifyUseCase, getVeiculosByPlacaUseCase } })
}
