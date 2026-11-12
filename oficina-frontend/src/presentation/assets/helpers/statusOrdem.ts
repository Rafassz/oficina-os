import { IStatusOS } from '../../../application/models'

export const ROTULO_STATUS: Record<IStatusOS, string> = {
  orcamento: 'Orçamento',
  aprovada: 'Aprovada',
  em_execucao: 'Em execução',
  aguardando_peca: 'Aguardando peça',
  pronta: 'Pronta',
  entregue: 'Entregue',
  cancelada: 'Cancelada',
}

const ACAO_STATUS: Record<IStatusOS, string> = {
  orcamento: 'Voltar para orçamento',
  aprovada: 'Cliente aprovou',
  em_execucao: 'Iniciar serviço',
  aguardando_peca: 'Parar: aguardando peça',
  pronta: 'Marcar como pronta',
  entregue: 'Entregar ao cliente',
  cancelada: 'Cancelar OS',
}

// Texto do botão que leva a OS de um status para outro
export const rotuloAcao = (de: IStatusOS, para: IStatusOS) => {
  if (para === 'em_execucao' && de === 'aguardando_peca') return 'Peça chegou, retomar'
  if (para === 'em_execucao' && de === 'pronta') return 'Reabrir: voltar p/ execução'
  return ACAO_STATUS[para]
}

// só para pintar a data em vermelho; quem decide o filtro de atrasadas é a API
export const pareceAtrasada = (previsao: string | null, status: IStatusOS) =>
  Boolean(previsao) && !['pronta', 'entregue', 'cancelada'].includes(status) && new Date(previsao!).getTime() < Date.now()
