import bcrypt from 'bcryptjs'
import {
  IDataBaseError,
  INotFoundError,
  IRequiredFieldError,
  IResultError,
  IUnknownError,
  IWrongCredentials,
  LogThis,
  RequiredFieldError,
  Result,
  WrongCredentials,
  gerarToken,
  textoOuVazio,
} from '../../../../utils'
import { IUsuarioRepository } from '../../../usuario/repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | INotFoundError | IRequiredFieldError | IWrongCredentials

export interface ILoginUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class LoginUseCase implements ILoginUseCase {
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: { repository: { usuarioRepository: IUsuarioRepository } }) {
    this._usuarioRepository = props.repository.usuarioRepository
  }

  @LogThis('LoginUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const email = textoOuVazio(request.email).toLowerCase()
    if (!email) return Result.fail(RequiredFieldError({ key: 'email' }))
    if (!request.senha) return Result.fail(RequiredFieldError({ key: 'senha' }))

    // mesma mensagem para e-mail inexistente, senha errada ou usuário desativado:
    // não entregar quais e-mails existem no sistema
    const credenciaisInvalidas = WrongCredentials({ message: 'E-mail ou senha incorretos' })

    const busca = await this._usuarioRepository.findByEmail({ email })
    if (busca.isFailure) {
      return Result.fail(busca.error!.type === 'NotFoundError' ? credenciaisInvalidas : busca.error!)
    }

    const usuario = busca.getValue()!
    if (!usuario.ativo) return Result.fail(credenciaisInvalidas)
    if (!(await bcrypt.compare(request.senha, usuario.senhaHash))) return Result.fail(credenciaisInvalidas)

    const { senhaHash, ...semSenha } = usuario
    const token = gerarToken({ IdUsuario: usuario._id, Nome: usuario.nome, Papel: usuario.papel })

    return Result.ok({ token, usuario: semSenha })
  }
}
