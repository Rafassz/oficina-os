import { IOrdemServico, IStatusOS } from './IOrdemServico'

export interface IDashboardSummary {
  porStatus: Partial<Record<IStatusOS, number>>
  emAberto: number
  atrasadas: number
  faturamentoMes: number
  entreguesMes: number
  ticketMedio: number
  proximasEntregas: Pick<IOrdemServico, '_id' | 'numero' | 'status' | 'previsaoEntrega' | 'veiculo' | 'cliente'>[]
}
