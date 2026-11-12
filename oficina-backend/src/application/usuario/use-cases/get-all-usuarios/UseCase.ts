import {
  IDataBaseError,
  IInvalidFieldError,
  IPapel,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  Result,
} from '../../../../utils'
import { PAPEIS } from '../../models'
import { IUsuarioRepository } from '../../repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | IInvalidFieldError

export interface IGetAllUsuariosUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class GetAllUsuariosUseCase implements IGetAllUsuariosUseCase {
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: { repository: { usuarioRepository: IUsuarioRepository } }) {
    this._usuarioRepository = props.repository.usuarioRepository
  }

  @LogThis('GetAllUsuariosUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    let papel: IPapel | null = null
    if (request.papel) {
      if (!PAPEIS.includes(request.papel as IPapel)) {
        return Result.fail(InvalidFieldError({ key: 'papel', message: `Papel deve ser um de: ${PAPEIS.join(', ')}` }))
      }
      papel = request.papel as IPapel
    }

    const usuarios = await this._usuarioRepository.getAll({ papel, somenteAtivos: true })
    if (usuarios.isFailure) return Result.fail(usuarios.error!)

    return Result.ok(usuarios.getValue()!)
  }
}
