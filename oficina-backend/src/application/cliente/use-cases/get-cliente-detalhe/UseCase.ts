import {
  IDataBaseError,
  IInvalidFieldError,
  INotFoundError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  Result,
  idValido,
} from '../../../../utils'
import { IOrdemServicoRepository } from '../../../ordem-servico/repositories'
import { montarResposta } from '../../../ordem-servico/use-cases/shared'
import { IVeiculoRepository } from '../../../veiculo/repositories'
import { IClienteRepository } from '../../repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | INotFoundError | IInvalidFieldError

export interface IGetClienteDetalheUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export const LIMITE_HISTORICO_CLIENTE = 30

export class GetClienteDetalheUseCase implements IGetClienteDetalheUseCase {
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

  @LogThis('GetClienteDetalheUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdCliente)) return Result.fail(InvalidFieldError({ key: 'IdCliente' }))
    const { IdCliente } = request

    const cliente = await this._clienteRepository.findById({ IdCliente })
    if (cliente.isFailure) return Result.fail(cliente.error!)

    const [veiculos, ordens] = await Promise.all([
      this._veiculoRepository.getByCliente({ IdCliente }),
      this._ordemServicoRepository.getByCliente({ IdCliente, limite: LIMITE_HISTORICO_CLIENTE }),
    ])
    if (veiculos.isFailure) return Result.fail(veiculos.error!)
    if (ordens.isFailure) return Result.fail(ordens.error!)

    const respostas = ordens.getValue()!.map(montarResposta)
    const totalGasto = respostas.filter((o) => o.status === 'entregue').reduce((acc, o) => acc + o.total, 0)

    return Result.ok({ cliente: cliente.getValue()!, veiculos: veiculos.getValue()!, ordens: respostas, totalGasto })
  }
}
