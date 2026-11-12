import { itensParaLinhas, linhasParaItens, previaTotais, subtotalLinha } from '../edicaoItens'

describe('edição de itens da OS', () => {
  it('ida e volta entre itens da API e linhas da tela não perde nada', () => {
    const itens = [
      { tipo: 'peca' as const, descricao: 'Óleo 5W30 (L)', quantidade: 4.5, valorUnitario: 5200 },
      { tipo: 'servico' as const, descricao: 'Troca de óleo', quantidade: 1, valorUnitario: 125090 },
    ]

    const linhas = itensParaLinhas(itens)

    expect(linhas[0]).toMatchObject({ quantidade: '4,5', valor: '52,00' })
    expect(linhas[1].valor).toBe('1.250,90')
    expect(linhasParaItens(linhas)).toEqual(itens)
  })

  it('cada linha nova ganha uma chave diferente', () => {
    const linhas = itensParaLinhas([
      { tipo: 'peca', descricao: 'a', quantidade: 1, valorUnitario: 1 },
      { tipo: 'peca', descricao: 'b', quantidade: 1, valorUnitario: 1 },
    ])

    expect(linhas[0].chave).not.toBe(linhas[1].chave)
  })

  it('linha sem descrição é ignorada ao salvar', () => {
    const itens = linhasParaItens([{ chave: 'x', tipo: 'peca', descricao: '   ', quantidade: '1', valor: '10' }])

    expect(itens).toEqual([])
  })

  it('subtotal aceita quantidade com vírgula', () => {
    expect(subtotalLinha({ quantidade: '1,5', valor: '80' })).toBe(12000)
  })

  it('prévia dos totais separa peças e mão de obra e não fica negativa', () => {
    const itens = [
      { tipo: 'peca' as const, descricao: 'Pastilha', quantidade: 1, valorUnitario: 125090 },
      { tipo: 'servico' as const, descricao: 'Diagnóstico', quantidade: 1.5, valorUnitario: 8000 },
    ]

    expect(previaTotais(itens, 1090)).toEqual({ pecas: 125090, servicos: 12000, desconto: 1090, total: 136000 })
    expect(previaTotais([], 500).total).toBe(0)
  })
})
