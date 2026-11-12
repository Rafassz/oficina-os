import { IDataBaseError, IResultError, IUnknownError, LogThis, Result } from '../../../../utils'
import { STATUS_FINALIZADOS } from '../../../ordem-servico/models'
import { IOrdemServicoRepository } from '../../../ordem-servico/repositories'
import { calcularTotais } from '../../../ordem-servico/use-cases/shared'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError

export interface IGetDashboardSummaryUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export const QTD_PROXIMAS_ENTREGAS = 8

export class GetDashboardSummaryUseCase implements IGetDashboardSummaryUseCase {
  private readonly _ordemServicoRepository: IOrdemServicoRepository

  constructor(props: { repository: { ordemServicoRepository: IOrdemServicoRepository } }) {
    this._ordemServicoRepository = props.repository.ordemServicoRepository
  }

  @LogThis('GetDashboardSummaryUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const { agora } = request
    const inicioDoMes = new Date(agora.getFullYear(), agora.getMonth(), 1)

    const [porStatus, atrasadas, entregues, proximas] = await Promise.all([
      this._ordemServicoRepository.contarPorStatus({ statusNotIn: STATUS_FINALIZADOS }),
      // carro pronto esperando o cliente não conta como atraso da oficina
      this._ordemServicoRepository.contarAtrasadas({ statusNotIn: [...STATUS_FINALIZADOS, 'pronta'], agora }),
      this._ordemServicoRepository.getEntreguesDesde({ desde: inicioDoMes }),
      this._ordemServicoRepository.getProximasEntregas({ statusNotIn: STATUS_FINALIZADOS, limite: QTD_PROXIMAS_ENTREGAS }),
    ])
    if (porStatus.isFailure) return Result.fail(porStatus.error!)
    if (atrasadas.isFailure) return Result.fail(atrasadas.error!)
    if (entregues.isFailure) return Result.fail(entregues.error!)
    if (proximas.isFailure) return Result.fail(proximas.error!)

    const contagem = porStatus.getValue()!
    const faturamentoMes = entregues.getValue()!.reduce((acc, os) => acc + calcularTotais(os.itens, os.desconto).total, 0)
    const entreguesMes = entregues.getValue()!.length

    return Result.ok({
      porStatus: contagem,
      emAberto: Object.values(contagem).reduce((acc, qtd) => acc + (qtd ?? 0), 0),
      atrasadas: atrasadas.getValue()!,
      faturamentoMes,
      entreguesMes,
      ticketMedio: entreguesMes ? Math.round(faturamentoMes / entreguesMes) : 0,
      proximasEntregas: proximas.getValue()!.map(({ _id, numero, status, previsaoEntrega, veiculo, cliente }) => ({
        _id,
        numero,
        status,
        previsaoEntrega,
        veiculo,
        cliente,
      })),
    })
  }
}
