import { useCallback } from 'react'
import { ICliente, IClienteDetalhe, IClienteParams, IPagina } from '../../application/models'
import { useAxiosInstances } from '../axios-instance'

export const useClienteApi = () => {
  const { axiosAuthInstance } = useAxiosInstances()

  const getClientesApi = useCallback(
    async (data: { busca?: string; pagina: number }): Promise<IPagina<ICliente>> => {
      const result = await axiosAuthInstance.get('/clientes', {
        params: { busca: data.busca || undefined, pagina: data.pagina },
      })
      return result.data
    },
    [axiosAuthInstance],
  )

  const getClienteDetalheApi = useCallback(
    async (IdCliente: string): Promise<IClienteDetalhe> => {
      const result = await axiosAuthInstance.get(`/clientes/${IdCliente}`)
      return result.data
    },
    [axiosAuthInstance],
  )

  const createClienteApi = useCallback(
    async (data: IClienteParams): Promise<ICliente> => {
      const result = await axiosAuthInstance.post('/clientes', {
        nome: data.nome,
        telefone: data.telefone,
        documento: data.documento,
        email: data.email,
        observacoes: data.observacoes,
      })
      return result.data
    },
    [axiosAuthInstance],
  )

  const updateClienteApi = useCallback(
    async (IdCliente: string, data: IClienteParams): Promise<ICliente> => {
      const result = await axiosAuthInstance.put(`/clientes/${IdCliente}`, {
        nome: data.nome,
        telefone: data.telefone,
        documento: data.documento,
        email: data.email,
        observacoes: data.observacoes,
      })
      return result.data
    },
    [axiosAuthInstance],
  )

  const deleteClienteApi = useCallback(
    async (IdCliente: string): Promise<void> => {
      await axiosAuthInstance.delete(`/clientes/${IdCliente}`)
    },
    [axiosAuthInstance],
  )

  return { getClientesApi, getClienteDetalheApi, createClienteApi, updateClienteApi, deleteClienteApi }
}
