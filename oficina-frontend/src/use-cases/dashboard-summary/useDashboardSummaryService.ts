import { useCallback } from 'react'
import { setDashboardSummaryState } from '../../application/states/dashboard-summary'
import { mensagemDeErro } from '../../infra/axios-instance'
import { useDashboardSummaryApi } from '../../infra/dashboard-summary'
import { useAppDispatch, useAppSelector } from '../../presentation/hooks/store-hooks'
import { useUIService } from '../ui'

export const useDashboardSummaryService = () => {
  const dispatch = useAppDispatch()
  const resumo = useAppSelector((state) => state.dashboardSummary.resumo)
  const { getDashboardSummaryApi } = useDashboardSummaryApi()
  const { setAlerta } = useUIService()

  const carregarResumo = useCallback(async () => {
    try {
      dispatch(setDashboardSummaryState(await getDashboardSummaryApi()))
    } catch (error) {
      setAlerta({ tipo: 'erro', mensagem: mensagemDeErro(error) })
    }
  }, [dispatch, getDashboardSummaryApi, setAlerta])

  return { resumo, carregarResumo }
}
