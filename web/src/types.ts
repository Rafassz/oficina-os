export type StatusOS =
  | 'orcamento'
  | 'aprovada'
  | 'em_execucao'
  | 'aguardando_peca'
  | 'pronta'
  | 'entregue'
  | 'cancelada';

export type Papel = 'admin' | 'atendente' | 'mecanico';

export interface Usuario {
  id: string;
  _id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface Cliente {
  _id: string;
  nome: string;
  telefone: string;
  documento?: string;
  email?: string;
  observacoes?: string;
  createdAt: string;
}

export interface Veiculo {
  _id: string;
  cliente: string;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  km?: number;
}

export interface ItemOS {
  _id?: string;
  tipo: 'peca' | 'servico';
  descricao: string;
  quantidade: number;
  valorUnitario: number; // centavos
}

export interface EventoHistorico {
  status: StatusOS;
  em: string;
  por?: { _id: string; nome: string } | null;
  obs?: string;
}

export interface OrdemServico {
  _id: string;
  numero: number;
  cliente: Pick<Cliente, '_id' | 'nome' | 'telefone'>;
  veiculo: Pick<Veiculo, '_id' | 'placa' | 'marca' | 'modelo' | 'ano' | 'cor'>;
  mecanico: { _id: string; nome: string } | null;
  status: StatusOS;
  kmEntrada?: number;
  relato: string;
  diagnostico: string;
  itens: ItemOS[];
  desconto: number;
  totalPecas: number;
  totalServicos: number;
  total: number;
  previsaoEntrega: string | null;
  entregueEm: string | null;
  historico: EventoHistorico[];
  proximosStatus: StatusOS[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  porPagina: number;
}

export interface Painel {
  porStatus: Partial<Record<StatusOS, number>>;
  emAberto: number;
  atrasadas: number;
  faturamentoMes: number;
  entreguesMes: number;
  ticketMedio: number;
  proximasEntregas: Pick<OrdemServico, '_id' | 'numero' | 'status' | 'previsaoEntrega' | 'veiculo' | 'cliente'>[];
}
