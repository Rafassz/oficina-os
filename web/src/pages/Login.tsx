import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { mensagemDeErro, useLoginMutation } from '../store/api';
import { Aviso } from '../components/pecas';

export default function Login() {
  const token = useAppSelector((s) => s.auth.token);
  const local = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  if (token) {
    const destino = (local.state as { de?: string } | null)?.de ?? '/';
    return <Navigate to={destino} replace />;
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    login({ email, senha });
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

        <Aviso>{mensagemDeErro(error)}</Aviso>

        <button className="btn btn-destaque" disabled={isLoading}>
          {isLoading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
