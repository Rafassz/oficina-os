import { useCallback } from 'react'
import { IPapel, IUsuario } from '../../application/models'
import { useAxiosInstances } from '../axios-instance'

export const useUsuarioApi = () => {
  const { axiosAuthInstance } = useAxiosInstances()

  const getUsuariosApi = useCallback(
    async (papel?: IPapel): Promise<IUsuario[]> => {
      const result = await axiosAuthInstance.get('/usuarios', { params: { papel } })
      return result.data
    },
    [axiosAuthInstance],
  )

  return { getUsuariosApi }
}
