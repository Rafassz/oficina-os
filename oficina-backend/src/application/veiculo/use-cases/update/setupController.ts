import { JwtAuthMiddleware } from '../../../../utils'
import { MongoVeiculoRepository } from '../../repositories'
import { MongoUsuarioRepository } from '../../../usuario/repositories'
import { UpdateVeiculoController } from './Controller'
import { UpdateVeiculoUseCase } from './UseCase'

export const setupUpdateVeiculoController = () => {
  const veiculoRepository = new MongoVeiculoRepository()
  const usuarioRepository = new MongoUsuarioRepository()

  const authVerifyUseCase = new JwtAuthMiddleware({ repository: { usuarioRepository } })
  const updateVeiculoUseCase = new UpdateVeiculoUseCase({ repository: { veiculoRepository } })

  return new UpdateVeiculoController({ useCase: { authVerifyUseCase, updateVeiculoUseCase } })
}
