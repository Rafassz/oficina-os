import type { StatusOS } from '../types';

export const ROTULO_STATUS: Record<StatusOS, string> = {
  orcamento: 'Orçamento',
  aprovada: 'Aprovada',
  em_execucao: 'Em execução',
  aguardando_peca: 'Aguardando peça',
  pronta: 'Pronta',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
};

// Texto do botão que leva a OS de um status para outro
export function rotuloAcao(de: StatusOS, para: StatusOS) {
  if (para === 'em_execucao' && de === 'aguardando_peca') return 'Peça chegou, retomar';
  if (para === 'em_execucao' && de === 'pronta') return 'Reabrir: voltar p/ execução';
  return ACAO_STATUS[para];
}

const ACAO_STATUS: Record<StatusOS, string> = {
  orcamento: 'Voltar para orçamento',
  aprovada: 'Cliente aprovou',
  em_execucao: 'Iniciar serviço',
  aguardando_peca: 'Parar: aguardando peça',
  pronta: 'Marcar como pronta',
  entregue: 'Entregar ao cliente',
  cancelada: 'Cancelar OS',
};
