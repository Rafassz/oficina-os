import { IItemOS, IOrdemServicoDetalhada, IStatusOS, ITotaisOS, TRANSICOES_OS } from '../../models'

// Regras de cálculo compartilhadas pelos casos de uso de OS (e pelo painel / ficha do cliente)

export const subtotalItens = (itens: Pick<IItemOS, 'quantidade' | 'valorUnitario'>[]) =>
  itens.reduce((acc, i) => acc + Math.round(i.quantidade * i.valorUnitario), 0)

export const calcularTotais = (itens: IItemOS[], desconto: number): ITotaisOS => {
  const totalPecas = subtotalItens(itens.filter((i) => i.tipo === 'peca'))
  const totalServicos = subtotalItens(itens.filter((i) => i.tipo === 'servico'))
  return { totalPecas, totalServicos, total: Math.max(0, totalPecas + totalServicos - desconto) }
}

export const proximosStatus = (atual: IStatusOS) => TRANSICOES_OS[atual]

export const podeMudarStatus = (de: IStatusOS, para: IStatusOS) => TRANSICOES_OS[de].includes(para)

export type IOrdemServicoResposta = IOrdemServicoDetalhada & ITotaisOS & { proximosStatus: IStatusOS[] }

// Formato que a tela recebe: OS + totais + próximos passos permitidos
export const montarResposta = (ordem: IOrdemServicoDetalhada): IOrdemServicoResposta => ({
  ...ordem,
  ...calcularTotais(ordem.itens, ordem.desconto),
  proximosStatus: proximosStatus(ordem.status),
})
