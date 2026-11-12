import { FormEvent, useState } from 'react'
import { ICliente, IClienteParams } from '../../../../../../application/models'
import { useClientesService } from '../../../../../../use-cases/clientes'
import { Aviso } from '../../../../../components'

interface IProps {
  inicial?: ICliente
  onSalvo: (cliente: ICliente) => void
  onCancelar?: () => void
}

export const FormCliente = ({ inicial, onSalvo, onCancelar }: IProps) => {
  const { salvarCliente } = useClientesService()
  const [form, setForm] = useState<IClienteParams>({
    _id: inicial?._id,
    nome: inicial?.nome ?? '',
    telefone: inicial?.telefone ?? '',
    documento: inicial?.documento ?? '',
    email: inicial?.email ?? '',
    observacoes: inicial?.observacoes ?? '',
  })
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const campo = (nome: Exclude<keyof IClienteParams, '_id'>) => ({
    value: form[nome],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [nome]: e.target.value })),
  })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const resultado = await salvarCliente(form)
    setEnviando(false)
    if (resultado.ok) onSalvo(resultado.dados)
    else setErro(resultado.mensagem)
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
      <Aviso>{erro}</Aviso>
      <div className="acoes">
        {onCancelar && (
          <button type="button" className="btn" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button className="btn btn-destaque" disabled={enviando}>
          {inicial ? 'Salvar' : 'Cadastrar cliente'}
        </button>
      </div>
    </form>
  )
}
