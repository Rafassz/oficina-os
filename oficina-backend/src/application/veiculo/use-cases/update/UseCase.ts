import {
  IDataBaseError,
  IInvalidFieldError,
  INotAcceptableError,
  INotFoundError,
  IRequiredFieldError,
  IResultError,
  IUniqueKeyDuplicateError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  NotAcceptableError,
  Result,
  UniqueKeyDuplicateError,
  idValido,
} from '../../../../utils'
import { IVeiculoRepository } from '../../repositories'
import { validarVeiculo } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | INotAcceptableError
  | IUniqueKeyDuplicateError

export interface IUpdateVeiculoUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class UpdateVeiculoUseCase implements IUpdateVeiculoUseCase {
  private readonly _veiculoRepository: IVeiculoRepository

  constructor(props: { repository: { veiculoRepository: IVeiculoRepository } }) {
    this._veiculoRepository = props.repository.veiculoRepository
  }

  @LogThis('UpdateVeiculoUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdVeiculo)) return Result.fail(InvalidFieldError({ key: 'IdVeiculo' }))
    const { IdVeiculo, ...campos } = request

    const atual = await this._veiculoRepository.findById({ IdVeiculo })
    if (atual.isFailure) return Result.fail(atual.error!)

    const validacao = validarVeiculo(campos, 'edicao')
    if ('erro' in validacao) return Result.fail(validacao.erro)
    const dados = validacao.dados

    // hodômetro não volta: KM menor só por engano de digitação
    if (dados.km !== undefined && dados.km < (atual.getValue()!.km ?? 0)) {
      return Result.fail(
        NotAcceptableError({ message: `KM informado é menor que o último registrado (${atual.getValue()!.km})` }),
      )
    }

    if (dados.placa && dados.placa !== atual.getValue()!.placa) {
      const mesmaPlaca = await this._veiculoRepository.findByPlaca({ placa: dados.placa })
      if (mesmaPlaca.isSuccess) return Result.fail(UniqueKeyDuplicateError({ key: 'placa', value: dados.placa }))
      if (mesmaPlaca.error!.type !== 'NotFoundError') return Result.fail(mesmaPlaca.error!)
    }

    const atualizado = await this._veiculoRepository.update({ IdVeiculo, dados })
    if (atualizado.isFailure) return Result.fail(atualizado.error!)

    return Result.ok(atualizado.getValue()!)
  }
}
