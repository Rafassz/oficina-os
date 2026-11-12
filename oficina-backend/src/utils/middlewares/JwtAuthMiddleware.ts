import { Request } from 'express'
import type { IUsuarioRepository } from '../../application/usuario/repositories/interfaces'
import { IDataBaseError, IResultError, IUnknownError, IWrongCredentials, Result, WrongCredentials } from '../result'
import { lerToken, tokenDoHeader } from '../token'

type Errors = IUnknownError | IDataBaseError | IWrongCredentials

// Confere no banco se o usuário do token ainda existe e está ativo
export class JwtAuthMiddleware {
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: { repository: { usuarioRepository: IUsuarioRepository } }) {
    this._usuarioRepository = props.repository.usuarioRepository
  }

  async execute(req: Request): Promise<Result<void, IResultError<Errors>>> {
    try {
      const token = lerToken(tokenDoHeader(req.headers.authorization))

      const usuario = await this._usuarioRepository.findById({ IdUsuario: token.IdUsuario })
      if (usuario.isFailure) {
        return Result.fail(WrongCredentials({ message: 'Usuário não encontrado' }))
      }
      if (!usuario.getValue()!.ativo) {
        return Result.fail(WrongCredentials({ message: 'Usuário desativado' }))
      }

      return Result.ok()
    } catch (error) {
      return Result.fail(WrongCredentials({ message: 'Sessão expirada, entre novamente', extraInfo: String(error) }))
    }
  }
}
