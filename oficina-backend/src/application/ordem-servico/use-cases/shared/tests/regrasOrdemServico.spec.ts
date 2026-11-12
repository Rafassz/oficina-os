import { IItemOS } from '../../../models'
import { calcularTotais, podeMudarStatus, proximosStatus } from '../regrasOrdemServico'

describe('regras da ordem de serviço', () => {
  const itens: IItemOS[] = [
    { tipo: 'peca', descricao: 'Óleo 5W30 (L)', quantidade: 4.5, valorUnitario: 5200 },
    { tipo: 'peca', descricao: 'Filtro de óleo', quantidade: 1, valorUnitario: 3800 },
    { tipo: 'servico', descricao: 'Troca de óleo', quantidade: 1, valorUnitario: 6000 },
  ]

  it('deve separar peças e mão de obra e aplicar o desconto em centavos', () => {
    expect(calcularTotais(itens, 1000)).toEqual({ totalPecas: 27200, totalServicos: 6000, total: 32200 })
  })

  it('nunca deve dar total negativo', () => {
    expect(calcularTotais([], 500).total).toBe(0)
  })

  it('deve seguir o fluxo da oficina', () => {
    expect(podeMudarStatus('orcamento', 'aprovada')).toBe(true)
    expect(podeMudarStatus('orcamento', 'pronta')).toBe(false)
    expect(podeMudarStatus('pronta', 'em_execucao')).toBe(true)
    expect(proximosStatus('entregue')).toEqual([])
  })
})
