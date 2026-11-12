import { IOrdemServicoResposta } from '../../../../ordem-servico/use-cases/shared'
import { IVeiculo } from '../../../../veiculo/models'
import { ICliente } from '../../../models'

export interface IResponse {
  cliente: ICliente
  veiculos: IVeiculo[]
  ordens: IOrdemServicoResposta[]
  // soma do que já foi entregue e cobrado
  totalGasto: number
}
