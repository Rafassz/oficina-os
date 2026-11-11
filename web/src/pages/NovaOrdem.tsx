import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  mensagemDeErro,
  useAbrirOrdemMutation,
  useClienteQuery,
  useClientesQuery,
  useUsuariosQuery,
} from '../store/api';
import FormCliente from '../components/FormCliente';
import FormVeiculo from '../components/FormVeiculo';
import { Aviso, Placa } from '../components/pecas';
import { km as formatarKm, telefone } from '../lib/formato';

export default function NovaOrdem() {
  const [params] = useSearchParams();
  const navegar = useNavigate();

  const [clienteId, setClienteId] = useState<string | null>(params.get('cliente'));
  const [veiculoId, setVeiculoId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const [novoCliente, setNovoCliente] = useState(false);
  const [novoVeiculo, setNovoVeiculo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBuscaAtiva(busca.trim()), 300);
    return () => clearTimeout(t);
  }, [busca]);

  const { data: encontrados } = useClientesQuery({ busca: buscaAtiva }, { skip: buscaAtiva.length < 2 || !!clienteId });
  const { data: detalhe } = useClienteQuery(clienteId!, { skip: !clienteId });
  const { data: mecanicos } = useUsuariosQuery({ papel: 'mecanico' });

  // cliente com um carro só: já deixa selecionado
  useEffect(() => {
    if (detalhe && detalhe.veiculos.length === 1 && !veiculoId) setVeiculoId(detalhe.veiculos[0]._id);
  }, [detalhe, veiculoId]);

  const veiculo = detalhe?.veiculos.find((v) => v._id === veiculoId);

  const [kmEntrada, setKmEntrada] = useState('');
  const [relato, setRelato] = useState('');
  const [previsao, setPrevisao] = useState('');
  const [mecanico, setMecanico] = useState('');
  const [abrir, { isLoading, error }] = useAbrirOrdemMutation();

  function trocarCliente() {
    setClienteId(null);
    setVeiculoId(null);
    setNovoVeiculo(false);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!clienteId || !veiculoId) return;
    try {
      const os = await abrir({
        cliente: clienteId,
        veiculo: veiculoId,
        relato,
        kmEntrada: kmEntrada ? Number(kmEntrada.replace(/\D/g, '')) : undefined,
        previsaoEntrega: previsao || undefined,
        mecanico: mecanico || undefined,
      }).unwrap();
      navegar(`/ordens/${os._id}`, { replace: true });
    } catch {
      /* erro no Aviso */
    }
  }

  return (
    <>
      <header className="cabecalho">
        <h1>Abrir ordem de serviço</h1>
        <Link to="/ordens" className="link">
          Voltar
        </Link>
      </header>

      {/* 1. cliente */}
      <section className="bloco etapa">
        <h2>
          <span className="passo">1</span> Cliente
        </h2>

        {clienteId && detalhe ? (
          <div className="escolhido">
            <div>
              <strong>{detalhe.cliente.nome}</strong>
              <span className="sutil">{telefone(detalhe.cliente.telefone)}</span>
            </div>
            <button className="link" onClick={trocarCliente}>
              trocar
            </button>
          </div>
        ) : novoCliente ? (
          <FormCliente
            onSalvo={(c) => {
              setClienteId(c._id);
              setNovoCliente(false);
              setNovoVeiculo(true);
            }}
            onCancelar={() => setNovoCliente(false)}
          />
        ) : (
          <>
            <input
              type="search"
              placeholder="Buscar por nome, telefone ou CPF"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              autoFocus
            />
            {encontrados && (
              <ul className="opcoes">
                {encontrados.itens.map((c) => (
                  <li key={c._id}>
                    <button onClick={() => setClienteId(c._id)}>
                      <strong>{c.nome}</strong>
                      <span className="sutil">{telefone(c.telefone)}</span>
                    </button>
                  </li>
                ))}
                {encontrados.itens.length === 0 && <li className="vazio">Ninguém encontrado com “{buscaAtiva}”.</li>}
              </ul>
            )}
            <button className="btn" onClick={() => setNovoCliente(true)}>
              Cliente novo
            </button>
          </>
        )}
      </section>

      {/* 2. veículo */}
      {clienteId && detalhe && (
        <section className="bloco etapa">
          <h2>
            <span className="passo">2</span> Veículo
          </h2>
          {novoVeiculo ? (
            <FormVeiculo
              clienteId={clienteId}
              onSalvo={(v) => {
                setVeiculoId(v._id);
                setKmEntrada(v.km ? String(v.km) : '');
                setNovoVeiculo(false);
              }}
              onCancelar={detalhe.veiculos.length ? () => setNovoVeiculo(false) : undefined}
            />
          ) : (
            <>
              <ul className="opcoes veiculos">
                {detalhe.veiculos.map((v) => (
                  <li key={v._id}>
                    <button className={v._id === veiculoId ? 'marcado' : ''} onClick={() => setVeiculoId(v._id)}>
                      <Placa valor={v.placa} />
                      <span>
                        {v.marca} {v.modelo} {v.ano && `· ${v.ano}`}
                      </span>
                      <span className="sutil">{formatarKm(v.km)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button className="btn" onClick={() => setNovoVeiculo(true)}>
                Outro veículo
              </button>
            </>
          )}
        </section>
      )}

      {/* 3. entrada */}
      {veiculo && (
        <form className="bloco etapa" onSubmit={enviar}>
          <h2>
            <span className="passo">3</span> Entrada na oficina
          </h2>
          <div className="grade">
            <label className="larga">
              O que o cliente relatou
              <textarea
                value={relato}
                onChange={(e) => setRelato(e.target.value)}
                rows={3}
                placeholder="Ex.: barulho na roda dianteira ao passar em lombada"
                required
                minLength={3}
              />
            </label>
            <label>
              KM de entrada
              <input
                value={kmEntrada}
                onChange={(e) => setKmEntrada(e.target.value)}
                inputMode="numeric"
                placeholder={veiculo.km ? `último: ${veiculo.km}` : ''}
              />
            </label>
            <label>
              Previsão de entrega
              <input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} />
            </label>
            <label>
              Mecânico responsável
              <select value={mecanico} onChange={(e) => setMecanico(e.target.value)}>
                <option value="">definir depois</option>
                {mecanicos?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Aviso>{mensagemDeErro(error)}</Aviso>
          <div className="acoes">
            <button className="btn btn-destaque" disabled={isLoading}>
              Abrir OS
            </button>
          </div>
        </form>
      )}
    </>
  );
}
