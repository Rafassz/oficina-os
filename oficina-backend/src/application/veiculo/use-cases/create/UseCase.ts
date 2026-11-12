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
import { IClienteRepository } from '../../../cliente/repositories'
import { IVeiculoRepository } from '../../repositories'
import { validarVeiculo } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | IUniqueKeyDuplicateError

export interface ICreateVeiculoUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class CreateVeiculoUseCase implements ICreateVeiculoUseCase {
  private readonly _veiculoRepository: IVeiculoRepository
  private readonly _clienteRepository: IClienteRepository

  constructor(props: { repository: { veiculoRepository: IVeiculoRepository; clienteRepository: IClienteRepository } }) {
    this._veiculoRepository = props.repository.veiculoRepository
    this._clienteRepository = props.repository.clienteRepository
  }

  @LogThis('CreateVeiculoUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    // 1 - dono
    if (!idValido(request.IdCliente)) return Result.fail(InvalidFieldError({ key: 'cliente' }))
    const dono = await this._clienteRepository.findById({ IdCliente: request.IdCliente })
    if (dono.isFailure) return Result.fail(dono.error!)

    // 2 - dados do veículo
    const { IdCliente, ...campos } = request
    const validacao = validarVeiculo(campos, 'criacao')
    if ('erro' in validacao) return Result.fail(validacao.erro)
    const dados = validacao.dados

    // 3 - placa é única no sistema
    const mesmaPlaca = await this._veiculoRepository.findByPlaca({ placa: dados.placa! })
    if (mesmaPlaca.isSuccess) return Result.fail(UniqueKeyDuplicateError({ key: 'placa', value: dados.placa }))
    if (mesmaPlaca.error!.type !== 'NotFoundError') return Result.fail(mesmaPlaca.error!)

    const criado = await this._veiculoRepository.create({
      cliente: IdCliente!,
      placa: dados.placa!,
      marca: dados.marca!,
      modelo: dados.modelo!,
      ano: dados.ano,
      cor: dados.cor,
      km: dados.km,
    })
    if (criado.isFailure) return Result.fail(criado.error!)

    return Result.ok(criado.getValue()!)
  }
}
