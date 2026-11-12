import {
  IDataBaseError,
  IInvalidFieldError,
  INotAcceptableError,
  INotFoundError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  NotAcceptableError,
  Result,
  idValido,
} from '../../../../utils'
import { IOrdemServicoRepository } from '../../../ordem-servico/repositories'
import { IVeiculoRepository } from '../../../veiculo/repositories'
import { IClienteRepository } from '../../repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | INotFoundError | IInvalidFieldError | INotAcceptableError

export interface IDeleteClienteUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class DeleteClienteUseCase implements IDeleteClienteUseCase {
  private readonly _clienteRepository: IClienteRepository
  private readonly _veiculoRepository: IVeiculoRepository
  private readonly _ordemServicoRepository: IOrdemServicoRepository

  constructor(props: {
    repository: {
      clienteRepository: IClienteRepository
      veiculoRepository: IVeiculoRepository
      ordemServicoRepository: IOrdemServicoRepository
    }
  }) {
    this._clienteRepository = props.repository.clienteRepository
    this._veiculoRepository = props.repository.veiculoRepository
    this._ordemServicoRepository = props.repository.ordemServicoRepository
  }

  @LogThis('DeleteClienteUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdCliente)) return Result.fail(InvalidFieldError({ key: 'IdCliente' }))

    // histórico de serviço é documento da oficina: cliente com OS não sai do sistema
    const temOrdens = await this._ordemServicoRepository.existsByCliente({ IdCliente: request.IdCliente })
    if (temOrdens.isFailure) return Result.fail(temOrdens.error!)
    if (temOrdens.getValue()) {
      return Result.fail(
        NotAcceptableError({ message: 'Cliente tem ordens de serviço registradas e não pode ser excluído' }),
      )
    }

    const excluido = await this._clienteRepository.delete({ IdCliente: request.IdCliente })
    if (excluido.isFailure) return Result.fail(excluido.error!)

    const veiculos = await this._veiculoRepository.deleteByCliente({ IdCliente: request.IdCliente })
    if (veiculos.isFailure) return Result.fail(veiculos.error!)

    return Result.ok()
  }
}
