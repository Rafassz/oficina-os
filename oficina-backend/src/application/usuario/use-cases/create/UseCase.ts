import bcrypt from 'bcryptjs'
import {
  IDataBaseError,
  IInvalidFieldError,
  INotAcceptableError,
  INotFoundError,
  IPapel,
  IRequiredFieldError,
  IResultError,
  IUniqueKeyDuplicateError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  NotAcceptableError,
  RequiredFieldError,
  Result,
  UniqueKeyDuplicateError,
  emailValido,
  lerToken,
  textoOuVazio,
} from '../../../../utils'
import { PAPEIS } from '../../models'
import { IUsuarioRepository } from '../../repositories'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | INotAcceptableError
  | IUniqueKeyDuplicateError

export interface ICreateUsuarioUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export const TAMANHO_MINIMO_SENHA = 6

export class CreateUsuarioUseCase implements ICreateUsuarioUseCase {
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: { repository: { usuarioRepository: IUsuarioRepository } }) {
    this._usuarioRepository = props.repository.usuarioRepository
  }

  @LogThis('CreateUsuarioUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    // 1 - quem está pedindo precisa ser admin (conferido no banco, não só no token)
    const { IdUsuario } = lerToken(request.token)
    const solicitante = await this._usuarioRepository.findById({ IdUsuario })
    if (solicitante.isFailure) return Result.fail(solicitante.error!)
    if (solicitante.getValue()!.papel !== 'admin') {
      return Result.fail(NotAcceptableError({ message: 'Apenas administradores podem cadastrar usuários' }))
    }

    // 2 - validar dados
    const nome = textoOuVazio(request.nome)
    const email = textoOuVazio(request.email).toLowerCase()
    if (nome.length < 2) return Result.fail(RequiredFieldError({ key: 'nome' }))
    if (!email) return Result.fail(RequiredFieldError({ key: 'email' }))
    if (!emailValido(email)) return Result.fail(InvalidFieldError({ key: 'email', message: 'E-mail inválido' }))
    if (!request.senha || request.senha.length < TAMANHO_MINIMO_SENHA) {
      return Result.fail(
        InvalidFieldError({ key: 'senha', message: `A senha precisa de pelo menos ${TAMANHO_MINIMO_SENHA} caracteres` }),
      )
    }
    if (!PAPEIS.includes(request.papel as IPapel)) {
      return Result.fail(InvalidFieldError({ key: 'papel', message: `Papel deve ser um de: ${PAPEIS.join(', ')}` }))
    }

    // 3 - e-mail único
    const existente = await this._usuarioRepository.findByEmail({ email })
    if (existente.isSuccess) return Result.fail(UniqueKeyDuplicateError({ key: 'e-mail', value: email }))
    if (existente.error!.type !== 'NotFoundError') return Result.fail(existente.error!)

    // 4 - gravar
    const criado = await this._usuarioRepository.create({
      nome,
      email,
      papel: request.papel as IPapel,
      senhaHash: await bcrypt.hash(request.senha, 10),
    })
    if (criado.isFailure) return Result.fail(criado.error!)

    return Result.ok(criado.getValue()!)
  }
}
