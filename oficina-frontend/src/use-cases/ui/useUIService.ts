import { useCallback } from 'react'
import { IAlerta, resetAlertaState, setAlertaState } from '../../application/states/ui'
import { useAppDispatch } from '../../presentation/hooks/store-hooks'

export const useUIService = () => {
  const dispatch = useAppDispatch()

  const setAlerta = useCallback((alerta: IAlerta) => dispatch(setAlertaState(alerta)), [dispatch])
  const limparAlerta = useCallback(() => dispatch(resetAlertaState()), [dispatch])

  return { setAlerta, limparAlerta }
}
