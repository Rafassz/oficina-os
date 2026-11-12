import { IOrdemServicoResposta } from '../../shared'

export interface IResponse {
  itens: IOrdemServicoResposta[]
  total: number
  pagina: number
  porPagina: number
}
