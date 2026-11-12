import { useCallback } from 'react'
import { ISessao, IUsuario } from '../../application/models'
import { useAxiosInstances } from '../axios-instance'

export const useAuthApi = () => {
  const { axiosInstance, axiosAuthInstance } = useAxiosInstances()

  // os nomes dos campos são exatamente os que o Controller do backend lê
  const loginApi = useCallback(
    async (data: { email: string; senha: string }): Promise<ISessao> => {
      const result = await axiosInstance.post('/auth/login', { email: data.email, senha: data.senha })
      return result.data
    },
    [axiosInstance],
  )

  const getMeApi = useCallback(async (): Promise<IUsuario> => {
    const result = await axiosAuthInstance.get('/auth/me')
    return result.data
  }, [axiosAuthInstance])

  return { loginApi, getMeApi }
}
