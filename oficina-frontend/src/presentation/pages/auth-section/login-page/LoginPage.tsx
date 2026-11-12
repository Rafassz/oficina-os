import { FormEvent, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthService } from '../../../../use-cases/auth'
import { Aviso } from '../../../components'
import { useAppSelector } from '../../../hooks/store-hooks'

export const LoginPage = () => {
  const token = useAppSelector((state) => state.auth.token)
  const local = useLocation()
  const { login } = useAuthService()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (token) {
    const destino = (local.state as { de?: string } | null)?.de ?? '/'
    return <Navigate to={destino} replace />
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const resultado = await login(email, senha)
    setEnviando(false)
    setErro(resultado.ok ? null : resultado.mensagem)
  }

  return (
    <div className="tela-login">
      <form className="cartao-login" onSubmit={enviar}>
        <div className="marca">
          <strong>Oficina Prado</strong>
          <span>controle de ordens de serviço</span>
        </div>

        <label>
          E-mail
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Senha
          <input
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        <Aviso>{erro}</Aviso>

        <button className="btn btn-destaque" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
