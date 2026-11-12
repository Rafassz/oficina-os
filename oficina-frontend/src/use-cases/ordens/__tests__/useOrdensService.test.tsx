import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { criarStore } from '../../../application/states/store'
import { useOrdensService } from '../useOrdensService'

// a camada de infra é substituída: aqui só interessa o que o service faz com o retorno
const api = {
  getOrdensApi: vi.fn(),
  getOrdemByIdApi: vi.fn(),
  createOrdemApi: vi.fn(),
  updateOrdemApi: vi.fn(),
  mudarStatusApi: vi.fn(),
}
vi.mock('../../../infra/ordem-servico', () => ({ useOrdemServicoApi: () => api }))

const erroDaApi = (message: string) =>
  Object.assign(new Error(message), { isAxiosError: true, response: { status: 406, data: { message } } })

const montar = () => {
  const store = criarStore()
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
  return { store, ...renderHook(() => useOrdensService(), { wrapper }) }
}

describe('useOrdensService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('carrega a lista com os filtros guardados no Redux', async () => {
    api.getOrdensApi.mockResolvedValue({ itens: [], total: 0, pagina: 1, porPagina: 20 })
    const { result, store } = montar()

    act(() => result.current.setFiltroStatus('atrasadas'))
    await act(() => result.current.carregarOrdens())

    expect(api.getOrdensApi).toHaveBeenCalledWith({ status: 'atrasadas', busca: '', pagina: 1 })
    expect(store.getState().ordens.lista?.total).toBe(0)
  })

  it('trocar a aba volta para a primeira página', () => {
    const { result, store } = montar()

    act(() => result.current.setPagina(3))
    act(() => result.current.setFiltroStatus('pronta'))

    expect(store.getState().ordens.filtros.pagina).toBe(1)
  })

  it('mudar status guarda a OS devolvida pela API', async () => {
    const devolvida = { _id: 'os1', status: 'aprovada' }
    api.mudarStatusApi.mockResolvedValue(devolvida)
    const { result, store } = montar()

    let resultado
    await act(async () => {
      resultado = await result.current.mudarStatus('os1', 'aprovada')
    })

    expect(api.mudarStatusApi).toHaveBeenCalledWith('os1', { status: 'aprovada', obs: undefined })
    expect(resultado).toEqual({ ok: true, dados: devolvida })
    expect(store.getState().ordens.ordemAtual).toEqual(devolvida)
  })

  it('devolve a mensagem da regra de negócio quando a API recusa', async () => {
    api.mudarStatusApi.mockRejectedValue(erroDaApi('Inclua ao menos um item no orçamento antes de aprovar'))
    const { result, store } = montar()

    let resultado
    await act(async () => {
      resultado = await result.current.mudarStatus('os1', 'aprovada')
    })

    expect(resultado).toEqual({ ok: false, mensagem: 'Inclua ao menos um item no orçamento antes de aprovar' })
    expect(store.getState().ordens.ordemAtual).toBeNull()
  })

  it('falha ao carregar a lista vira alerta na tela', async () => {
    api.getOrdensApi.mockRejectedValue(Object.assign(new Error('offline'), { isAxiosError: true }))
    const { result, store } = montar()

    await act(() => result.current.carregarOrdens())

    expect(store.getState().ui.alerta).toEqual({ tipo: 'erro', mensagem: 'Sem conexão com o servidor' })
    expect(store.getState().ordens.carregandoLista).toBe(false)
  })
})
