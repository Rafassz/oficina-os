import { useCallback } from 'react'
import {
  IEdicaoOrdemParams,
  IFiltroStatusOS,
  INovaOrdemParams,
  IOrdemServico,
  IResultado,
  IStatusOS,
} from '../../application/models'
import {
  setOrdemAtualState,
  setOrdensCarregandoState,
  setOrdensFiltroBuscaState,
  setOrdensFiltroStatusState,
  setOrdensListaState,
  setOrdensPaginaState,
} from '../../application/states/ordens'
import { mensagemDeErro } from '../../infra/axios-instance'
import { useOrdemServicoApi } from '../../infra/ordem-servico'
import { useAppDispatch, useAppSelector } from '../../presentation/hooks/store-hooks'
import { useUIService } from '../ui'

export const useOrdensService = () => {
  const dispatch = useAppDispatch()
  const { lista, carregandoLista, filtros, ordemAtual } = useAppSelector((state) => state.ordens)
  const { getOrdensApi, getOrdemByIdApi, createOrdemApi, updateOrdemApi, mudarStatusApi } = useOrdemServicoApi()
  const { setAlerta } = useUIService()

  // ---------- lista

  const carregarOrdens = useCallback(async () => {
    dispatch(setOrdensCarregandoState(true))
    try {
      dispatch(setOrdensListaState(await getOrdensApi(filtros)))
    } catch (error) {
      dispatch(setOrdensCarregandoState(false))
      setAlerta({ tipo: 'erro', mensagem: mensagemDeErro(error) })
    }
  }, [dispatch, getOrdensApi, filtros, setAlerta])

  const setFiltroStatus = useCallback((status: IFiltroStatusOS) => dispatch(setOrdensFiltroStatusState(status)), [dispatch])
  const setBusca = useCallback((busca: string) => dispatch(setOrdensFiltroBuscaState(busca)), [dispatch])
  const setPagina = useCallback((pagina: number) => dispatch(setOrdensPaginaState(pagina)), [dispatch])

  // ---------- uma OS

  const aplicarResultado = useCallback(
    async (chamada: () => Promise<IOrdemServico>): Promise<IResultado<IOrdemServico>> => {
      try {
        const ordem = await chamada()
        dispatch(setOrdemAtualState(ordem))
        return { ok: true, dados: ordem }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [dispatch],
  )

  const carregarOrdem = useCallback(
    async (IdOrdemServico: string) => {
      // não mostra a OS anterior enquanto carrega a nova
      if (ordemAtual?._id !== IdOrdemServico) dispatch(setOrdemAtualState(null))
      return aplicarResultado(() => getOrdemByIdApi(IdOrdemServico))
    },
    [aplicarResultado, getOrdemByIdApi, ordemAtual?._id, dispatch],
  )

  const abrirOrdem = useCallback(
    (params: INovaOrdemParams) => aplicarResultado(() => createOrdemApi(params)),
    [aplicarResultado, createOrdemApi],
  )

  const salvarOrdem = useCallback(
    (IdOrdemServico: string, params: IEdicaoOrdemParams) => aplicarResultado(() => updateOrdemApi(IdOrdemServico, params)),
    [aplicarResultado, updateOrdemApi],
  )

  const mudarStatus = useCallback(
    (IdOrdemServico: string, status: IStatusOS, obs?: string) =>
      aplicarResultado(() => mudarStatusApi(IdOrdemServico, { status, obs })),
    [aplicarResultado, mudarStatusApi],
  )

  return {
    lista,
    carregandoLista,
    filtros,
    ordemAtual,
    carregarOrdens,
    setFiltroStatus,
    setBusca,
    setPagina,
    carregarOrdem,
    abrirOrdem,
    salvarOrdem,
    mudarStatus,
  }
}
