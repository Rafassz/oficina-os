import {
  IDataBaseError,
  IInvalidFieldError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  Result,
  lerPaginacao,
  normalizarPlaca,
  textoOuVazio,
} from '../../../../utils'
import { IClienteRepository } from '../../../cliente/repositories'
import { IVeiculoRepository } from '../../../veiculo/repositories'
import { IStatusOS, STATUS_FINALIZADOS, STATUS_OS } from '../../models'
import { IGetAllOrdensParams, IOrdemServicoRepository } from '../../repositories'
import { montarResposta } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | IInvalidFieldError

export interface IGetAllOrdensUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

type FiltroStatus = Pick<IGetAllOrdensParams, 'statusIn' | 'statusNotIn' | 'previsaoAntesDe'>

export class GetAllOrdensUseCase implements IGetAllOrdensUseCase {
  private readonly _ordemServicoRepository: IOrdemServicoRepository
  private readonly _veiculoRepository: IVeiculoRepository
  private readonly _clienteRepository: IClienteRepository

  constructor(props: {
    repository: {
      ordemServicoRepository: IOrdemServicoRepository
      veiculoRepository: IVeiculoRepository
      clienteRepository: IClienteRepository
    }
  }) {
    this._ordemServicoRepository = props.repository.ordemServicoRepository
    this._veiculoRepository = props.repository.veiculoRepository
    this._clienteRepository = props.repository.clienteRepository
  }

  @LogThis('GetAllOrdensUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const { pagina, porPagina } = lerPaginacao(request.pagina, request.porPagina)
    const vazio: IResponse = { itens: [], total: 0, pagina, porPagina }

    // 1 - o que cada aba da tela significa
    const filtro = this.filtroDeStatus(textoOuVazio(request.status), new Date())
    if ('erro' in filtro) return Result.fail(filtro.erro)

    // 2 - um campo só para número, placa ou cliente: procura nos três e junta
    const busca = textoOuVazio(request.busca)
    let numero: number | null = null
    let IdsVeiculo: string[] | null = null
    let IdsCliente: string[] | null = null

    if (busca) {
      if (/^\d+$/.test(busca)) numero = Number(busca)

      const placa = normalizarPlaca(busca)
      if (placa.length >= 3) {
        const veiculos = await this._veiculoRepository.findIdsByTrechoPlaca({ trecho: placa })
        if (veiculos.isFailure) return Result.fail(veiculos.error!)
        if (veiculos.getValue()!.length) IdsVeiculo = veiculos.getValue()!
      }

      const clientes = await this._clienteRepository.findIdsByNome({ nome: busca })
      if (clientes.isFailure) return Result.fail(clientes.error!)
      if (clientes.getValue()!.length) IdsCliente = clientes.getValue()!

      // digitou algo que não bate com nada: nem vai ao banco de OS
      if (numero === null && !IdsVeiculo && !IdsCliente) return Result.ok(vazio)
    }

    const ordens = await this._ordemServicoRepository.getAll({
      ...filtro.filtro,
      numero,
      IdsVeiculo,
      IdsCliente,
      pagina,
      porPagina,
    })
    if (ordens.isFailure) return Result.fail(ordens.error!)

    return Result.ok({
      itens: ordens.getValue()!.itens.map(montarResposta),
      total: ordens.getValue()!.total,
      pagina,
      porPagina,
    })
  }

  private filtroDeStatus(status: string, agora: Date): { erro: IResultError<IInvalidFieldError> } | { filtro: FiltroStatus } {
    if (!status) return { filtro: { statusIn: null, statusNotIn: null, previsaoAntesDe: null } }

    if (status === 'abertas') {
      return { filtro: { statusIn: null, statusNotIn: STATUS_FINALIZADOS, previsaoAntesDe: null } }
    }

    // atrasada = passou da previsão e ainda não ficou pronta
    if (status === 'atrasadas') {
      return { filtro: { statusIn: null, statusNotIn: [...STATUS_FINALIZADOS, 'pronta'], previsaoAntesDe: agora } }
    }

    const lista = status.split(',').map((s) => s.trim())
    const invalido = lista.find((s) => !STATUS_OS.includes(s as IStatusOS))
    if (invalido) return { erro: InvalidFieldError({ key: 'status', message: `Status desconhecido: ${invalido}` }) }

    return { filtro: { statusIn: lista as IStatusOS[], statusNotIn: null, previsaoAntesDe: null } }
  }
}
