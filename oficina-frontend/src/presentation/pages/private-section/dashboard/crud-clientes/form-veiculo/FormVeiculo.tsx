import { FormEvent, useState } from 'react'
import { IVeiculo } from '../../../../../../application/models'
import { useClientesService } from '../../../../../../use-cases/clientes'
import { Aviso } from '../../../../../components'

interface IProps {
  IdCliente: string
  onSalvo: (veiculo: IVeiculo) => void
  onCancelar?: () => void
}

const MARCAS = ['Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 'Renault', 'Toyota', 'Volkswagen']

export const FormVeiculo = ({ IdCliente, onSalvo, onCancelar }: IProps) => {
  const { cadastrarVeiculo } = useClientesService()
  const [placa, setPlaca] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [ano, setAno] = useState('')
  const [cor, setCor] = useState('')
  const [km, setKm] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    const resultado = await cadastrarVeiculo({
      cliente: IdCliente,
      placa,
      marca,
      modelo,
      cor: cor || undefined,
      ano: ano ? Number(ano) : undefined,
      km: km ? Number(km.replace(/\D/g, '')) : undefined,
    })
    setEnviando(false)
    if (resultado.ok) onSalvo(resultado.dados)
    else setErro(resultado.mensagem)
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div className="grade">
        <label>
          Placa
          <input
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            placeholder="ABC1D23"
            maxLength={8}
            className="mono"
            required
            autoFocus
          />
        </label>
        <label>
          Marca
          <input value={marca} onChange={(e) => setMarca(e.target.value)} list="marcas" required />
        </label>
        <label>
          Modelo
          <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Onix LT 1.0" required />
        </label>
        <label>
          Ano
          <input value={ano} onChange={(e) => setAno(e.target.value)} inputMode="numeric" maxLength={4} />
        </label>
        <label>
          Cor
          <input value={cor} onChange={(e) => setCor(e.target.value)} />
        </label>
        <label>
          KM atual
          <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="numeric" />
        </label>
      </div>
      <datalist id="marcas">
        {MARCAS.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
      <Aviso>{erro}</Aviso>
      <div className="acoes">
        {onCancelar && (
          <button type="button" className="btn" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button className="btn btn-destaque" disabled={enviando}>
          Cadastrar veículo
        </button>
      </div>
    </form>
  )
}
