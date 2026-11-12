import {
  IDataBaseError,
  IInvalidFieldError,
  INotFoundError,
  IRequiredFieldError,
  IResultError,
  IUniqueKeyDuplicateError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  Result,
  UniqueKeyDuplicateError,
  idValido,
} from '../../../../utils'
import { IClienteRepository, IUpdateClienteParams } from '../../repositories'
import { validarCliente } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | IUniqueKeyDuplicateError

export interface IUpdateClienteUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

const OPCIONAIS = ['documento', 'email', 'observacoes'] as const

export class UpdateClienteUseCase implements IUpdateClienteUseCase {
  private readonly _clienteRepository: IClienteRepository

  constructor(props: { repository: { clienteRepository: IClienteRepository } }) {
    this._clienteRepository = props.repository.clienteRepository
  }

  @LogThis('UpdateClienteUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdCliente)) return Result.fail(InvalidFieldError({ key: 'IdCliente' }))

    const { IdCliente, ...campos } = request
    const validacao = validarCliente(campos, 'edicao')
    if ('erro' in validacao) return Result.fail(validacao.erro)
    const dados = validacao.dados

    // CPF/CNPJ não pode ser de outro cliente
    if (dados.documento) {
      const dono = await this._clienteRepository.findByDocumento({ documento: dados.documento })
      if (dono.isSuccess && dono.getValue()!._id !== IdCliente) {
        return Result.fail(UniqueKeyDuplicateError({ key: 'CPF/CNPJ', value: dados.documento }))
      }
      if (dono.isFailure && dono.error!.type !== 'NotFoundError') return Result.fail(dono.error!)
    }

    // opcional enviado vazio = apagar o campo
    const remover: IUpdateClienteParams['remover'] = OPCIONAIS.filter((c) => dados[c] === '')
    const gravar = Object.fromEntries(Object.entries(dados).filter(([, v]) => v !== ''))

    const atualizado = await this._clienteRepository.update({ IdCliente, dados: gravar, remover })
    if (atualizado.isFailure) return Result.fail(atualizado.error!)

    return Result.ok(atualizado.getValue()!)
  }
}
