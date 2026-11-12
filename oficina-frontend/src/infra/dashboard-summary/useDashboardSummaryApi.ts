import { useCallback } from 'react'
import { IDashboardSummary } from '../../application/models'
import { useAxiosInstances } from '../axios-instance'

export const useDashboardSummaryApi = () => {
  const { axiosAuthInstance } = useAxiosInstances()

  const getDashboardSummaryApi = useCallback(async (): Promise<IDashboardSummary> => {
    const result = await axiosAuthInstance.get('/painel')
    return result.data
  }, [axiosAuthInstance])

  return { getDashboardSummaryApi }
}
