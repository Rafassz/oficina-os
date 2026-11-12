import { useCallback } from 'react'
import { IResultado } from '../../application/models'
import { resetSessaoState, setSessaoState } from '../../application/states/auth'
import { useAuthApi } from '../../infra/auth'
import { mensagemDeErro } from '../../infra/axios-instance'
import { useAppDispatch } from '../../presentation/hooks/store-hooks'
import { limparSessaoSalva, salvarSessao } from '../local-storage'

export const useAuthService = () => {
  const dispatch = useAppDispatch()
  const { loginApi } = useAuthApi()

  const login = useCallback(
    async (email: string, senha: string): Promise<IResultado<void>> => {
      if (!email.trim() || !senha) return { ok: false, mensagem: 'Informe e-mail e senha' }
      try {
        const sessao = await loginApi({ email: email.trim(), senha })
        salvarSessao(sessao)
        dispatch(setSessaoState(sessao))
        return { ok: true, dados: undefined }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [loginApi, dispatch],
  )

  const sair = useCallback(() => {
    limparSessaoSalva()
    dispatch(resetSessaoState())
  }, [dispatch])

  return { login, sair }
}
