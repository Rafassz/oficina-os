import {
  IInvalidFieldError,
  IRequiredFieldError,
  IResultError,
  InvalidFieldError,
  RequiredFieldError,
  documentoValido,
  emailValido,
  somenteDigitos,
  telefoneValido,
  textoOuVazio,
} from '../../../../utils'

export interface IDadosClienteEntrada {
  nome?: string
  telefone?: string
  documento?: string
  email?: string
  observacoes?: string
}

export interface IDadosClienteNormalizados {
  nome?: string
  telefone?: string
  // '' quer dizer "apagar o campo"
  documento?: string
  email?: string
  observacoes?: string
}

type ErroValidacao = IResultError<IRequiredFieldError | IInvalidFieldError>

export const TAMANHO_MAXIMO_OBSERVACOES = 500

/**
 * Normaliza e valida os dados de cliente. Na criação todos os obrigatórios precisam vir;
 * na edição só valida o que foi enviado.
 */
export const validarCliente = (
  dados: IDadosClienteEntrada,
  modo: 'criacao' | 'edicao',
): { erro: ErroValidacao } | { dados: IDadosClienteNormalizados } => {
  const saida: IDadosClienteNormalizados = {}
  const exigir = modo === 'criacao'

  if (dados.nome !== undefined || exigir) {
    const nome = textoOuVazio(dados.nome)
    if (nome.length < 3) {
      return { erro: nome ? InvalidFieldError({ key: 'nome', message: 'Nome muito curto' }) : RequiredFieldError({ key: 'nome' }) }
    }
    saida.nome = nome
  }

  if (dados.telefone !== undefined || exigir) {
    const telefone = somenteDigitos(textoOuVazio(dados.telefone))
    if (!telefone) return { erro: RequiredFieldError({ key: 'telefone' }) }
    if (!telefoneValido(telefone)) {
      return { erro: InvalidFieldError({ key: 'telefone', message: 'Telefone deve ter DDD + número' }) }
    }
    saida.telefone = telefone
  }

  if (dados.documento !== undefined) {
    const documento = somenteDigitos(textoOuVazio(dados.documento))
    if (documento && !documentoValido(documento)) {
      return { erro: InvalidFieldError({ key: 'documento', message: 'CPF/CNPJ incompleto' }) }
    }
    saida.documento = documento
  }

  if (dados.email !== undefined) {
    const email = textoOuVazio(dados.email).toLowerCase()
    if (email && !emailValido(email)) return { erro: InvalidFieldError({ key: 'email', message: 'E-mail inválido' }) }
    saida.email = email
  }

  if (dados.observacoes !== undefined) {
    const observacoes = textoOuVazio(dados.observacoes)
    if (observacoes.length > TAMANHO_MAXIMO_OBSERVACOES) {
      return { erro: InvalidFieldError({ key: 'observacoes', message: 'Observações muito longas' }) }
    }
    saida.observacoes = observacoes
  }

  return { dados: saida }
}
