export const STATUS_OS = [
  'orcamento',
  'aprovada',
  'em_execucao',
  'aguardando_peca',
  'pronta',
  'entregue',
  'cancelada',
] as const;

export type StatusOS = (typeof STATUS_OS)[number];

// Fluxo que a oficina segue na prática. Qualquer coisa fora disso é recusada pela API.
const TRANSICOES: Record<StatusOS, StatusOS[]> = {
  orcamento: ['aprovada', 'cancelada'],
  aprovada: ['em_execucao', 'cancelada'],
  em_execucao: ['aguardando_peca', 'pronta'],
  aguardando_peca: ['em_execucao', 'cancelada'],
  pronta: ['entregue', 'em_execucao'], // volta pra execução se o cliente reclamar no teste
  entregue: [],
  cancelada: [],
};

export const STATUS_FINALIZADOS: StatusOS[] = ['entregue', 'cancelada'];

// Depois de pronta o valor já foi passado pro cliente, então os itens não mudam mais.
export const STATUS_COM_ITENS_TRAVADOS: StatusOS[] = ['pronta', 'entregue', 'cancelada'];

export function proximosStatus(atual: StatusOS) {
  return TRANSICOES[atual];
}

export function podeMudar(de: StatusOS, para: StatusOS) {
  return TRANSICOES[de].includes(para);
}
