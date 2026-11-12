import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { criarStore } from '../../../application/states/store'
import { lerSessaoSalva } from '../../local-storage'
import { useAuthService } from '../useAuthService'

const api = { loginApi: vi.fn(), getMeApi: vi.fn() }
vi.mock('../../../infra/auth', () => ({ useAuthApi: () => api }))

const sessao = {
  token: 'abc.def.ghi',
  usuario: { _id: 'u1', nome: 'Marcos Prado', email: 'admin@oficina.local', papel: 'admin' as const, ativo: true },
}

const montar = () => {
  const store = criarStore()
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
  return { store, ...renderHook(() => useAuthService(), { wrapper }) }
}

describe('useAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('login guarda a sessão no Redux e no navegador', async () => {
    api.loginApi.mockResolvedValue(sessao)
    const { result, store } = montar()

    await act(() => result.current.login(' admin@oficina.local ', 'oficina123'))

    expect(api.loginApi).toHaveBeenCalledWith({ email: 'admin@oficina.local', senha: 'oficina123' })
    expect(store.getState().auth.token).toBe('abc.def.ghi')
    expect(lerSessaoSalva()).toEqual(sessao)
  })

  it('não chama a API com campos vazios', async () => {
    const { result } = montar()

    const resultado = await result.current.login('', '')

    expect(resultado.ok).toBe(false)
    expect(api.loginApi).not.toHaveBeenCalled()
  })

  it('sair limpa tudo', async () => {
    api.loginApi.mockResolvedValue(sessao)
    const { result, store } = montar()
    await act(() => result.current.login('admin@oficina.local', 'oficina123'))

    act(() => result.current.sair())

    expect(store.getState().auth.token).toBeNull()
    expect(lerSessaoSalva()).toBeNull()
  })
})
