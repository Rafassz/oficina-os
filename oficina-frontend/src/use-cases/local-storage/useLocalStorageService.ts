import { ISessao } from '../../application/models'

const CHAVE_SESSAO = 'oficina.sessao'

// Funções puras (sem hook) porque o store também precisa ler a sessão na criação.
// try/catch: em aba anônima ou com storage bloqueado o app segue funcionando, só sem lembrar o login.

export const lerSessaoSalva = (): ISessao | null => {
  try {
    const salvo = localStorage.getItem(CHAVE_SESSAO)
    if (!salvo) return null
    const sessao = JSON.parse(salvo) as ISessao
    return sessao?.token && sessao?.usuario ? sessao : null
  } catch {
    return null
  }
}

export const salvarSessao = (sessao: ISessao) => {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
  } catch {
    /* sem storage, só não lembra */
  }
}

export const limparSessaoSalva = () => {
  try {
    localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    /* idem */
  }
}

export const useLocalStorageService = () => ({ lerSessaoSalva, salvarSessao, limparSessaoSalva })
