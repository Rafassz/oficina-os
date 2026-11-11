import { FormEvent, useState } from 'react';
import { mensagemDeErro, useCadastrarVeiculoMutation } from '../store/api';
import type { Veiculo } from '../types';
import { Aviso } from './pecas';

interface Props {
  clienteId: string;
  onSalvo: (v: Veiculo) => void;
  onCancelar?: () => void;
}

export default function FormVeiculo({ clienteId, onSalvo, onCancelar }: Props) {
  const [cadastrar, { isLoading, error }] = useCadastrarVeiculoMutation();
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [km, setKm] = useState('');

  async function enviar(e: FormEvent) {
    e.preventDefault();
    try {
      const v = await cadastrar({
        cliente: clienteId,
        placa,
        marca,
        modelo,
        cor: cor || undefined,
        ano: ano ? Number(ano) : undefined,
        km: km ? Number(km.replace(/\D/g, '')) : undefined,
      }).unwrap();
      onSalvo(v);
    } catch {
      /* Aviso mostra o erro */
    }
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
        {['Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 'Renault', 'Toyota', 'Volkswagen'].map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
      <Aviso>{mensagemDeErro(error)}</Aviso>
      <div className="acoes">
        {onCancelar && (
          <button type="button" className="btn" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button className="btn btn-destaque" disabled={isLoading}>
          Cadastrar veículo
        </button>
      </div>
    </form>
  );
}
