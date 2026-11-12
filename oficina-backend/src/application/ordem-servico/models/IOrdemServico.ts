import { IStatusOS } from './IStatusOrdemServico'

// Valores sempre em centavos (inteiro) pra não ter problema de arredondamento com float
export interface IItemOS {
  tipo: 'peca' | 'servico'
  descricao: string
  quantidade: number
  valorUnitario: number
}

export interface IEventoHistorico {
  status: IStatusOS
  em: Date
  por: string | null
  obs?: string
}

// Como está gravado: referências por id
export interface IOrdemServico {
  _id: string
  numero: number
  cliente: string
  veiculo: string
  mecanico: string | null
  status: IStatusOS
  kmEntrada?: number
  relato: string
  diagnostico: string
  itens: IItemOS[]
  desconto: number
  previsaoEntrega: Date | null
  entregueEm: Date | null
  historico: IEventoHistorico[]
  createdAt: Date
  updatedAt: Date
}

// Como sai para a tela: referências já resolvidas
export interface IOrdemServicoDetalhada extends Omit<IOrdemServico, 'cliente' | 'veiculo' | 'mecanico' | 'historico'> {
  cliente: { _id: string; nome: string; telefone: string }
  veiculo: { _id: string; placa: string; marca: string; modelo: string; ano?: number; cor?: string }
  mecanico: { _id: string; nome: string } | null
  historico: (Omit<IEventoHistorico, 'por'> & { por: { _id: string; nome: string } | null })[]
}

export interface ITotaisOS {
  totalPecas: number
  totalServicos: number
  total: number
}
