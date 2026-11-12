import { useCallback } from 'react'
import { ICliente, IClienteDetalhe, IClienteParams, IResultado, IVeiculo, IVeiculoParams } from '../../application/models'
import {
  setClienteAtualState,
  setClientesBuscaState,
  setClientesCarregandoState,
  setClientesListaState,
  setClientesPaginaState,
} from '../../application/states/clientes'
import { mensagemDeErro } from '../../infra/axios-instance'
import { useClienteApi } from '../../infra/cliente'
import { useVeiculoApi } from '../../infra/veiculo'
import { useAppDispatch, useAppSelector } from '../../presentation/hooks/store-hooks'
import { useUIService } from '../ui'

export const useClientesService = () => {
  const dispatch = useAppDispatch()
  const { lista, carregandoLista, filtros, clienteAtual } = useAppSelector((state) => state.clientes)
  const { getClientesApi, getClienteDetalheApi, createClienteApi, updateClienteApi, deleteClienteApi } = useClienteApi()
  const { createVeiculoApi } = useVeiculoApi()
  const { setAlerta } = useUIService()

  // ---------- lista

  const carregarClientes = useCallback(async () => {
    dispatch(setClientesCarregandoState(true))
    try {
      dispatch(setClientesListaState(await getClientesApi(filtros)))
    } catch (error) {
      dispatch(setClientesCarregandoState(false))
      setAlerta({ tipo: 'erro', mensagem: mensagemDeErro(error) })
    }
  }, [dispatch, getClientesApi, filtros, setAlerta])

  const setBusca = useCallback((busca: string) => dispatch(setClientesBuscaState(busca)), [dispatch])
  const setPagina = useCallback((pagina: number) => dispatch(setClientesPaginaState(pagina)), [dispatch])

  // busca rápida da tela de abrir OS: não mexe na lista da tela de clientes
  const buscarClientes = useCallback(
    async (busca: string): Promise<IResultado<ICliente[]>> => {
      try {
        return { ok: true, dados: (await getClientesApi({ busca, pagina: 1 })).itens }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [getClientesApi],
  )

  // ---------- um cliente

  const carregarCliente = useCallback(
    async (IdCliente: string): Promise<IResultado<IClienteDetalhe>> => {
      try {
        const detalhe = await getClienteDetalheApi(IdCliente)
        dispatch(setClienteAtualState(detalhe))
        return { ok: true, dados: detalhe }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [dispatch, getClienteDetalheApi],
  )

  const salvarCliente = useCallback(
    async (params: IClienteParams): Promise<IResultado<ICliente>> => {
      try {
        const salvo = params._id ? await updateClienteApi(params._id, params) : await createClienteApi(params)
        if (clienteAtual?.cliente._id === salvo._id) dispatch(setClienteAtualState({ ...clienteAtual, cliente: salvo }))
        return { ok: true, dados: salvo }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [createClienteApi, updateClienteApi, clienteAtual, dispatch],
  )

  const excluirCliente = useCallback(
    async (IdCliente: string): Promise<IResultado<void>> => {
      try {
        await deleteClienteApi(IdCliente)
        dispatch(setClienteAtualState(null))
        return { ok: true, dados: undefined }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [deleteClienteApi, dispatch],
  )

  const cadastrarVeiculo = useCallback(
    async (params: IVeiculoParams): Promise<IResultado<IVeiculo>> => {
      try {
        const veiculo = await createVeiculoApi(params)
        if (clienteAtual?.cliente._id === params.cliente) {
          dispatch(setClienteAtualState({ ...clienteAtual, veiculos: [veiculo, ...clienteAtual.veiculos] }))
        }
        return { ok: true, dados: veiculo }
      } catch (error) {
        return { ok: false, mensagem: mensagemDeErro(error) }
      }
    },
    [createVeiculoApi, clienteAtual, dispatch],
  )

  return {
    lista,
    carregandoLista,
    filtros,
    clienteAtual,
    carregarClientes,
    setBusca,
    setPagina,
    buscarClientes,
    carregarCliente,
    salvarCliente,
    excluirCliente,
    cadastrarVeiculo,
  }
}
