export const STATUS_OS = [
  'orcamento',
  'aprovada',
  'em_execucao',
  'aguardando_peca',
  'pronta',
  'entregue',
  'cancelada',
] as const

export type IStatusOS = (typeof STATUS_OS)[number]

// Fluxo que a oficina segue na prática. Quem aplica é o UseCase de mudança de status.
export const TRANSICOES_OS: Record<IStatusOS, IStatusOS[]> = {
  orcamento: ['aprovada', 'cancelada'],
  aprovada: ['em_execucao', 'cancelada'],
  em_execucao: ['aguardando_peca', 'pronta'],
  aguardando_peca: ['em_execucao', 'cancelada'],
  pronta: ['entregue', 'em_execucao'], // volta pra execução se o cliente reclamar no teste
  entregue: [],
  cancelada: [],
}

export const STATUS_FINALIZADOS: IStatusOS[] = ['entregue', 'cancelada']

// Depois de pronta o valor já foi passado pro cliente
export const STATUS_COM_ITENS_TRAVADOS: IStatusOS[] = ['pronta', 'entregue', 'cancelada']
