import { IOrdemServicoDetalhada, IStatusOS } from '../../ordem-servico/models'

export interface IDashboardSummary {
  porStatus: Partial<Record<IStatusOS, number>>
  emAberto: number
  atrasadas: number
  faturamentoMes: number
  entreguesMes: number
  ticketMedio: number
  proximasEntregas: Pick<IOrdemServicoDetalhada, '_id' | 'numero' | 'status' | 'previsaoEntrega' | 'veiculo' | 'cliente'>[]
}
