import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ICliente } from '../../../../../../application/models'
import { useClientesService } from '../../../../../../use-cases/clientes'
import { useOrdensService } from '../../../../../../use-cases/ordens'
import { useUsuariosService } from '../../../../../../use-cases/usuarios'
import { km as formatarKm, telefone } from '../../../../../../utils/formatters'
import { Aviso, Placa } from '../../../../../components'
import { FormCliente } from '../../crud-clientes/form-cliente'
import { FormVeiculo } from '../../crud-clientes/form-veiculo'

const ESPERA_DIGITACAO_MS = 300

export const FormNovaOrdem = () => {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const { buscarClientes, carregarCliente, clienteAtual } = useClientesService()
  const { abrirOrdem } = useOrdensService()
  const { mecanicos, carregarMecanicos } = useUsuariosService()

  // 1. cliente
  const [IdCliente, setIdCliente] = useState<string | null>(params.get('cliente'))
  const [busca, setBusca] = useState('')
  const [encontrados, setEncontrados] = useState<ICliente[] | null>(null)
  const [novoCliente, setNovoCliente] = useState(false)

  // 2. veículo
  const [IdVeiculo, setIdVeiculo] = useState<string | null>(null)
  const [novoVeiculo, setNovoVeiculo] = useState(false)

  // 3. entrada
  const [kmEntrada, setKmEntrada] = useState('')
  const [relato, setRelato] = useState('')
  const [previsao, setPrevisao] = useState('')
  const [mecanico, setMecanico] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    carregarMecanicos()
  }, [carregarMecanicos])

  useEffect(() => {
    const termo = busca.trim()
    if (termo.length < 2 || IdCliente) {
      setEncontrados(null)
      return
    }
    const t = setTimeout(async () => {
      const resultado = await buscarClientes(termo)
      setEncontrados(resultado.ok ? resultado.dados : [])
    }, ESPERA_DIGITACAO_MS)
    return () => clearTimeout(t)
  }, [busca, IdCliente, buscarClientes])

  useEffect(() => {
    if (IdCliente) carregarCliente(IdCliente)
  }, [IdCliente, carregarCliente])

  const detalhe = clienteAtual?.cliente._id === IdCliente ? clienteAtual : null

  // cliente com um carro só: já deixa selecionado
  useEffect(() => {
    if (detalhe && detalhe.veiculos.length === 1 && !IdVeiculo) setIdVeiculo(detalhe.veiculos[0]._id)
  }, [detalhe, IdVeiculo])

  const veiculo = detalhe?.veiculos.find((v) => v._id === IdVeiculo)

  function trocarCliente() {
    setIdCliente(null)
    setIdVeiculo(null)
    setNovoVeiculo(false)
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!IdCliente || !IdVeiculo) return
    setEnviando(true)
    const resultado = await abrirOrdem({
      cliente: IdCliente,
      veiculo: IdVeiculo,
      relato,
      kmEntrada: kmEntrada ? Number(kmEntrada.replace(/\D/g, '')) : undefined,
      previsaoEntrega: previsao || undefined,
      mecanico: mecanico || undefined,
    })
    setEnviando(false)
    if (resultado.ok) navegar(`/ordens/${resultado.dados._id}`, { replace: true })
    else setErro(resultado.mensagem)
  }

  return (
    <>
      <header className="cabecalho">
        <h1>Abrir ordem de serviço</h1>
        <Link to="/ordens" className="link">
          Voltar
        </Link>
      </header>

      <section className="bloco etapa">
        <h2>
          <span className="passo">1</span> Cliente
        </h2>

        {IdCliente && detalhe ? (
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
              setIdCliente(c._id)
              setNovoCliente(false)
              setNovoVeiculo(true)
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
                {encontrados.map((c) => (
                  <li key={c._id}>
                    <button onClick={() => setIdCliente(c._id)}>
                      <strong>{c.nome}</strong>
                      <span className="sutil">{telefone(c.telefone)}</span>
                    </button>
                  </li>
                ))}
                {encontrados.length === 0 && <li className="vazio">Ninguém encontrado com “{busca.trim()}”.</li>}
              </ul>
            )}
            <button className="btn" onClick={() => setNovoCliente(true)}>
              Cliente novo
            </button>
          </>
        )}
      </section>

      {IdCliente && detalhe && (
        <section className="bloco etapa">
          <h2>
            <span className="passo">2</span> Veículo
          </h2>
          {novoVeiculo ? (
            <FormVeiculo
              IdCliente={IdCliente}
              onSalvo={(v) => {
                setIdVeiculo(v._id)
                setKmEntrada(v.km ? String(v.km) : '')
                setNovoVeiculo(false)
              }}
              onCancelar={detalhe.veiculos.length ? () => setNovoVeiculo(false) : undefined}
            />
          ) : (
            <>
              <ul className="opcoes veiculos">
                {detalhe.veiculos.map((v) => (
                  <li key={v._id}>
                    <button className={v._id === IdVeiculo ? 'marcado' : ''} onClick={() => setIdVeiculo(v._id)}>
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
                {mecanicos.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Aviso>{erro}</Aviso>
          <div className="acoes">
            <button className="btn btn-destaque" disabled={enviando}>
              Abrir OS
            </button>
          </div>
        </form>
      )}
    </>
  )
}
