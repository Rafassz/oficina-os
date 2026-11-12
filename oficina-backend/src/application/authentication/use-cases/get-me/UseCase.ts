import {
  IDataBaseError,
  INotFoundError,
  IResultError,
  IUnknownError,
  IWrongCredentials,
  LogThis,
  Result,
  WrongCredentials,
  lerToken,
} from '../../../../utils'
import { IUsuarioRepository } from '../../../usuario/repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | INotFoundError | IWrongCredentials

export interface IGetMeUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class GetMeUseCase implements IGetMeUseCase {
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: { repository: { usuarioRepository: IUsuarioRepository } }) {
    this._usuarioRepository = props.repository.usuarioRepository
  }

  @LogThis('GetMeUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const { IdUsuario } = lerToken(request.token)

    const usuario = await this._usuarioRepository.findById({ IdUsuario })
    if (usuario.isFailure) return Result.fail(usuario.error!)
    if (!usuario.getValue()!.ativo) return Result.fail(WrongCredentials({ message: 'Usuário desativado' }))

    return Result.ok(usuario.getValue()!)
  }
}
