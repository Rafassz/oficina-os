import { useCallback } from 'react'
import { setMecanicosState } from '../../application/states/usuarios'
import { mensagemDeErro } from '../../infra/axios-instance'
import { useUsuarioApi } from '../../infra/usuario'
import { useAppDispatch, useAppSelector } from '../../presentation/hooks/store-hooks'
import { useUIService } from '../ui'

export const useUsuariosService = () => {
  const dispatch = useAppDispatch()
  const mecanicos = useAppSelector((state) => state.usuarios.mecanicos)
  const { getUsuariosApi } = useUsuarioApi()
  const { setAlerta } = useUIService()

  const carregarMecanicos = useCallback(async () => {
    try {
      dispatch(setMecanicosState(await getUsuariosApi('mecanico')))
    } catch (error) {
      setAlerta({ tipo: 'erro', mensagem: mensagemDeErro(error) })
    }
  }, [dispatch, getUsuariosApi, setAlerta])

  return { mecanicos, carregarMecanicos }
}
