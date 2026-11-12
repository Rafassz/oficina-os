import type { ReactNode } from 'react'

export const Aviso = ({ children, tipo = 'erro' }: { children: ReactNode; tipo?: 'erro' | 'ok' }) => {
  if (!children) return null
  return (
    <p className={`aviso aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

export const Carregando = () => <p className="vazio">Carregando…</p>
