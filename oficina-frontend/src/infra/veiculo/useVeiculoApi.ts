import { useCallback } from 'react'
import { IVeiculo, IVeiculoParams } from '../../application/models'
import { useAxiosInstances } from '../axios-instance'

export const useVeiculoApi = () => {
  const { axiosAuthInstance } = useAxiosInstances()

  const createVeiculoApi = useCallback(
    async (data: IVeiculoParams): Promise<IVeiculo> => {
      const result = await axiosAuthInstance.post('/veiculos', data)
      return result.data
    },
    [axiosAuthInstance],
  )

  return { createVeiculoApi }
}
