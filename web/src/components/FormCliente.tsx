import { FormEvent, useState } from 'react';
import { mensagemDeErro, useSalvarClienteMutation } from '../store/api';
import type { Cliente } from '../types';
import { Aviso } from './pecas';

interface Props {
  inicial?: Cliente;
  onSalvo: (c: Cliente) => void;
  onCancelar?: () => void;
}

export default function FormCliente({ inicial, onSalvo, onCancelar }: Props) {
  const [salvar, { isLoading, error }] = useSalvarClienteMutation();
  const [form, setForm] = useState({
    nome: inicial?.nome ?? '',
    telefone: inicial?.telefone ?? '',
    documento: inicial?.documento ?? '',
    email: inicial?.email ?? '',
    observacoes: inicial?.observacoes ?? '',
  });

  const campo = (nome: keyof typeof form) => ({
    value: form[nome],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [nome]: e.target.value })),
  });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    try {
      const salvo = await salvar({ _id: inicial?._id, ...form }).unwrap();
      onSalvo(salvo);
    } catch {
      /* mensagem aparece no Aviso */
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div className="grade">
        <label className="larga">
          Nome / razão social
          <input {...campo('nome')} required minLength={3} autoFocus />
        </label>
        <label>
          Telefone (com DDD)
          <input {...campo('telefone')} inputMode="tel" placeholder="11 98888-7777" required />
        </label>
        <label>
          CPF / CNPJ <em>opcional</em>
          <input {...campo('documento')} inputMode="numeric" />
        </label>
        <label className="larga">
          E-mail <em>opcional</em>
          <input {...campo('email')} type="email" />
        </label>
        <label className="larga">
          Observações
          <textarea {...campo('observacoes')} rows={2} maxLength={500} />
        </label>
      </div>
      <Aviso>{mensagemDeErro(error)}</Aviso>
      <div className="acoes">
        {onCancelar && (
          <button type="button" className="btn" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button className="btn btn-destaque" disabled={isLoading}>
          {inicial ? 'Salvar' : 'Cadastrar cliente'}
        </button>
      </div>
    </form>
  );
}
