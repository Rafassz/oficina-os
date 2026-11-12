import {
  IInvalidFieldError,
  IRequiredFieldError,
  IResultError,
  InvalidFieldError,
  RequiredFieldError,
  normalizarPlaca,
  placaValida,
  textoOuVazio,
} from '../../../../utils'

export interface IDadosVeiculoEntrada {
  placa?: string
  marca?: string
  modelo?: string
  ano?: number | string
  cor?: string
  km?: number | string
}

export interface IDadosVeiculoNormalizados {
  placa?: string
  marca?: string
  modelo?: string
  ano?: number
  cor?: string
  km?: number
}

type ErroValidacao = IResultError<IRequiredFieldError | IInvalidFieldError>

export const ANO_MINIMO_VEICULO = 1950

const vazio = (v: unknown) => v === undefined || v === null || v === ''

export const validarVeiculo = (
  dados: IDadosVeiculoEntrada,
  modo: 'criacao' | 'edicao',
  agora: Date = new Date(),
): { erro: ErroValidacao } | { dados: IDadosVeiculoNormalizados } => {
  const saida: IDadosVeiculoNormalizados = {}
  const exigir = modo === 'criacao'

  if (dados.placa !== undefined || exigir) {
    const placa = normalizarPlaca(textoOuVazio(dados.placa))
    if (!placa) return { erro: RequiredFieldError({ key: 'placa' }) }
    if (!placaValida(placa)) {
      return { erro: InvalidFieldError({ key: 'placa', message: 'Placa inválida (use ABC1234 ou ABC1D23)' }) }
    }
    saida.placa = placa
  }

  for (const campo of ['marca', 'modelo'] as const) {
    if (dados[campo] !== undefined || exigir) {
      const valor = textoOuVazio(dados[campo])
      if (!valor) return { erro: RequiredFieldError({ key: campo }) }
      saida[campo] = valor
    }
  }

  if (!vazio(dados.ano)) {
    const ano = Number(dados.ano)
    // carro do ano que vem já é vendido no segundo semestre
    if (!Number.isInteger(ano) || ano < ANO_MINIMO_VEICULO || ano > agora.getFullYear() + 1) {
      return { erro: InvalidFieldError({ key: 'ano', message: 'Ano do veículo inválido' }) }
    }
    saida.ano = ano
  }

  if (!vazio(dados.km)) {
    const km = Number(dados.km)
    if (!Number.isInteger(km) || km < 0) return { erro: InvalidFieldError({ key: 'km', message: 'KM inválido' }) }
    saida.km = km
  }

  const cor = textoOuVazio(dados.cor)
  if (cor) saida.cor = cor

  return { dados: saida }
}
