import { ICliente } from './ICliente'
import { IVeiculo } from './IVeiculo'

export type IStatusOS = 'orcamento' | 'aprovada' | 'em_execucao' | 'aguardando_peca' | 'pronta' | 'entregue' | 'cancelada'

export interface IItemOS {
  tipo: 'peca' | 'servico'
  descricao: string
  quantidade: number
  valorUnitario: number // centavos
}

export interface IEventoHistorico {
  status: IStatusOS
  em: string
  por: { _id: string; nome: string } | null
  obs?: string
}

export interface IOrdemServico {
  _id: string
  numero: number
  cliente: Pick<ICliente, '_id' | 'nome' | 'telefone'>
  veiculo: Pick<IVeiculo, '_id' | 'placa' | 'marca' | 'modelo' | 'ano' | 'cor'>
  mecanico: { _id: string; nome: string } | null
  status: IStatusOS
  kmEntrada?: number
  relato: string
  diagnostico: string
  itens: IItemOS[]
  desconto: number
  totalPecas: number
  totalServicos: number
  total: number
  previsaoEntrega: string | null
  entregueEm: string | null
  historico: IEventoHistorico[]
  proximosStatus: IStatusOS[]
  createdAt: string
  updatedAt: string
}

export interface INovaOrdemParams {
  cliente: string
  veiculo: string
  relato: string
  kmEntrada?: number
  previsaoEntrega?: string
  mecanico?: string
}

export interface IEdicaoOrdemParams {
  diagnostico?: string
  itens?: IItemOS[]
  desconto?: number
  previsaoEntrega?: string | null
  mecanico?: string | null
}

// valores do filtro de abas da lista de OS (o backend entende cada um)
export type IFiltroStatusOS =
  | 'abertas'
  | 'atrasadas'
  | 'orcamento'
  | 'aprovada,em_execucao'
  | 'aguardando_peca'
  | 'pronta'
  | 'entregue'
  | ''
