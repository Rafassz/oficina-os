import { useCallback } from 'react'
import {
  IEdicaoOrdemParams,
  IFiltroStatusOS,
  INovaOrdemParams,
  IOrdemServico,
  IPagina,
  IStatusOS,
} from '../../application/models'
import { useAxiosInstances } from '../axios-instance'

export const useOrdemServicoApi = () => {
  const { axiosAuthInstance } = useAxiosInstances()

  const getOrdensApi = useCallback(
    async (data: { status: IFiltroStatusOS; busca?: string; pagina: number }): Promise<IPagina<IOrdemServico>> => {
      const result = await axiosAuthInstance.get('/ordens', {
        params: { status: data.status, busca: data.busca || undefined, pagina: data.pagina },
      })
      return result.data
    },
    [axiosAuthInstance],
  )

  const getOrdemByIdApi = useCallback(
    async (IdOrdemServico: string): Promise<IOrdemServico> => {
      const result = await axiosAuthInstance.get(`/ordens/${IdOrdemServico}`)
      return result.data
    },
    [axiosAuthInstance],
  )

  const createOrdemApi = useCallback(
    async (data: INovaOrdemParams): Promise<IOrdemServico> => {
      const result = await axiosAuthInstance.post('/ordens', data)
      return result.data
    },
    [axiosAuthInstance],
  )

  const updateOrdemApi = useCallback(
    async (IdOrdemServico: string, data: IEdicaoOrdemParams): Promise<IOrdemServico> => {
      const result = await axiosAuthInstance.put(`/ordens/${IdOrdemServico}`, data)
      return result.data
    },
    [axiosAuthInstance],
  )

  const mudarStatusApi = useCallback(
    async (IdOrdemServico: string, data: { status: IStatusOS; obs?: string }): Promise<IOrdemServico> => {
      const result = await axiosAuthInstance.post(`/ordens/${IdOrdemServico}/status`, data)
      return result.data
    },
    [axiosAuthInstance],
  )

  return { getOrdensApi, getOrdemByIdApi, createOrdemApi, updateOrdemApi, mudarStatusApi }
}
