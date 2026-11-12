import { IDataBaseError, IResultError, IUnknownError, LogThis, Result, normalizarPlaca, textoOuVazio } from '../../../../utils'
import { IVeiculoRepository } from '../../repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError

export interface IGetVeiculosByPlacaUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export const LIMITE_SUGESTOES_PLACA = 10

// É o que o atendente digita quando o carro encosta no portão
export class GetVeiculosByPlacaUseCase implements IGetVeiculosByPlacaUseCase {
  private readonly _veiculoRepository: IVeiculoRepository

  constructor(props: { repository: { veiculoRepository: IVeiculoRepository } }) {
    this._veiculoRepository = props.repository.veiculoRepository
  }

  @LogThis('GetVeiculosByPlacaUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const prefixo = normalizarPlaca(textoOuVazio(request.placa))
    if (!prefixo) return Result.ok([])

    const veiculos = await this._veiculoRepository.searchByPlaca({ prefixo, limite: LIMITE_SUGESTOES_PLACA })
    if (veiculos.isFailure) return Result.fail(veiculos.error!)

    return Result.ok(veiculos.getValue()!)
  }
}
