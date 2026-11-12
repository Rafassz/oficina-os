import { useEffect } from 'react'
import { useUIService } from '../../../use-cases/ui'
import { useAppSelector } from '../../hooks/store-hooks'

const TEMPO_NA_TELA_MS = 6000

export const AlertContainer = () => {
  const alerta = useAppSelector((state) => state.ui.alerta)
  const { limparAlerta } = useUIService()

  useEffect(() => {
    if (!alerta) return
    const t = setTimeout(limparAlerta, TEMPO_NA_TELA_MS)
    return () => clearTimeout(t)
  }, [alerta, limparAlerta])

  if (!alerta) return null
  return (
    <div className={`alerta-global ${alerta.tipo}`} role={alerta.tipo === 'erro' ? 'alert' : 'status'}>
      <span>{alerta.mensagem}</span>
      <button onClick={limparAlerta} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  )
}
