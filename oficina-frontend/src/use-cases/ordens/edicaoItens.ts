import { IItemOS } from '../../application/models'
import { centavosParaTexto, lerMoeda } from '../../utils/formatters'

// Na tela o valor fica como texto ("1.250,00") e só vira centavos na hora de salvar.
export interface ILinhaItem {
  chave: string
  tipo: IItemOS['tipo']
  descricao: string
  quantidade: string
  valor: string
}

let contadorLinha = 0
export const novaChaveLinha = () => `n${++contadorLinha}`

export const itensParaLinhas = (itens: IItemOS[]): ILinhaItem[] =>
  itens.map((i) => ({
    chave: novaChaveLinha(),
    tipo: i.tipo,
    descricao: i.descricao,
    quantidade: String(i.quantidade).replace('.', ','),
    valor: centavosParaTexto(i.valorUnitario),
  }))

export const lerQuantidade = (texto: string) => Number(texto.replace(',', '.')) || 0

// linha sem descrição é linha em branco que o usuário adicionou e não preencheu
export const linhasParaItens = (linhas: ILinhaItem[]): IItemOS[] =>
  linhas
    .filter((l) => l.descricao.trim())
    .map((l) => ({
      tipo: l.tipo,
      descricao: l.descricao.trim(),
      quantidade: lerQuantidade(l.quantidade),
      valorUnitario: lerMoeda(l.valor),
    }))

export const subtotalLinha = (linha: Pick<ILinhaItem, 'quantidade' | 'valor'>) =>
  Math.round(lerQuantidade(linha.quantidade) * lerMoeda(linha.valor))

// prévia enquanto edita; o valor que vale é o que a API devolve depois de salvar
export const previaTotais = (itens: IItemOS[], desconto: number) => {
  const soma = (tipo: IItemOS['tipo']) =>
    itens.filter((i) => i.tipo === tipo).reduce((a, i) => a + Math.round(i.quantidade * i.valorUnitario), 0)
  const pecas = soma('peca')
  const servicos = soma('servico')
  return { pecas, servicos, desconto, total: Math.max(0, pecas + servicos - desconto) }
}
