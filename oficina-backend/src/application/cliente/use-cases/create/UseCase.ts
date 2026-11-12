import {
  IDataBaseError,
  IInvalidFieldError,
  INotFoundError,
  IRequiredFieldError,
  IResultError,
  IUniqueKeyDuplicateError,
  IUnknownError,
  LogThis,
  Result,
  UniqueKeyDuplicateError,
} from '../../../../utils'
import { IClienteRepository } from '../../repositories'
import { validarCliente } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | IUniqueKeyDuplicateError

export interface ICreateClienteUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class CreateClienteUseCase implements ICreateClienteUseCase {
  private readonly _clienteRepository: IClienteRepository

  constructor(props: { repository: { clienteRepository: IClienteRepository } }) {
    this._clienteRepository = props.repository.clienteRepository
  }

  @LogThis('CreateClienteUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    // 1 - validar e normalizar
    const validacao = validarCliente(request, 'criacao')
    if ('erro' in validacao) return Result.fail(validacao.erro)
    const { nome, telefone, documento, email, observacoes } = validacao.dados

    // 2 - CPF/CNPJ não pode repetir
    if (documento) {
      const existente = await this._clienteRepository.findByDocumento({ documento })
      if (existente.isSuccess) return Result.fail(UniqueKeyDuplicateError({ key: 'CPF/CNPJ', value: documento }))
      if (existente.error!.type !== 'NotFoundError') return Result.fail(existente.error!)
    }

    // 3 - gravar (campos opcionais vazios não são gravados)
    const criado = await this._clienteRepository.create({
      nome: nome!,
      telefone: telefone!,
      ...(documento ? { documento } : {}),
      ...(email ? { email } : {}),
      ...(observacoes ? { observacoes } : {}),
    })
    if (criado.isFailure) return Result.fail(criado.error!)

    return Result.ok(criado.getValue()!)
  }
}
