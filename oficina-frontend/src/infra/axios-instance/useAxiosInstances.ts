import axios, { AxiosInstance } from 'axios'
import { useMemo } from 'react'
import { resetSessaoState } from '../../application/states/auth'
import { useAppDispatch, useAppSelector } from '../../presentation/hooks/store-hooks'
import { limparSessaoSalva } from '../../use-cases/local-storage'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const useAxiosInstances = (): { axiosInstance: AxiosInstance; axiosAuthInstance: AxiosInstance } => {
  const token = useAppSelector((state) => state.auth.token)
  const dispatch = useAppDispatch()

  const axiosInstance = useMemo(() => axios.create({ baseURL: BASE_URL }), [])

  const axiosAuthInstance = useMemo(() => {
    const instance = axios.create({ baseURL: BASE_URL })

    instance.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    // token expirou no meio do expediente: derruba a sessão e o router manda para o login
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          limparSessaoSalva()
          dispatch(resetSessaoState())
        }
        return Promise.reject(error)
      },
    )

    return instance
  }, [token, dispatch])

  return { axiosInstance, axiosAuthInstance }
}
