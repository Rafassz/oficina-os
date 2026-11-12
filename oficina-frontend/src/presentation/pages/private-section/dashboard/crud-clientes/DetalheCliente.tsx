import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useClientesService } from '../../../../../use-cases/clientes'
import { data, documento, km, linkWhatsApp, moeda, numeroOS, telefone } from '../../../../../utils/formatters'
import { Aviso, Carregando, Placa, StatusTag } from '../../../../components'
import { FormCliente } from './form-cliente'
import { FormVeiculo } from './form-veiculo'

export const DetalheCliente = () => {
  const { IdCliente } = useParams<{ IdCliente: string }>()
  const navegar = useNavigate()
  const { clienteAtual, carregarCliente, excluirCliente } = useClientesService()
  const [erroCarga, setErroCarga] = useState<string | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [novoVeiculo, setNovoVeiculo] = useState(false)

  useEffect(() => {
    if (IdCliente) carregarCliente(IdCliente).then((r) => setErroCarga(r.ok ? null : r.mensagem))
  }, [IdCliente, carregarCliente])

  if (erroCarga) return <Aviso>{erroCarga}</Aviso>
  if (!clienteAtual || clienteAtual.cliente._id !== IdCliente) return <Carregando />

  const { cliente, veiculos, ordens, totalGasto } = clienteAtual

  async function confirmarExclusao() {
    if (!window.confirm(`Excluir ${cliente.nome} e os veículos cadastrados? Isso não pode ser desfeito.`)) return
    const resultado = await excluirCliente(cliente._id)
    if (resultado.ok) navegar('/clientes', { replace: true })
    else setErroExclusao(resultado.mensagem)
  }

  return (
    <>
      <header className="cabecalho">
        <div>
          <h1>{cliente.nome}</h1>
          <span className="sutil">cliente desde {data(cliente.createdAt)}</span>
        </div>
        <div className="espaco" />
        <Link to={`/ordens/nova?cliente=${cliente._id}`} className="btn btn-destaque">
          Abrir OS
        </Link>
      </header>

      <section className="bloco">
        <h2>Dados</h2>
        {editando ? (
          <FormCliente inicial={cliente} onSalvo={() => setEditando(false)} onCancelar={() => setEditando(false)} />
        ) : (
          <>
            <dl className="dados">
              <dt>Telefone</dt>
              <dd>
                {telefone(cliente.telefone)}{' '}
                <a href={linkWhatsApp(cliente.telefone, '')} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </dd>
              <dt>CPF / CNPJ</dt>
              <dd>{documento(cliente.documento) || '—'}</dd>
              <dt>E-mail</dt>
              <dd>{cliente.email || '—'}</dd>
              {cliente.observacoes && (
                <>
                  <dt>Observações</dt>
                  <dd>{cliente.observacoes}</dd>
                </>
              )}
              <dt>Já gastou aqui</dt>
              <dd className="mono">{moeda(totalGasto)}</dd>
            </dl>
            <div className="acoes esquerda">
              <button className="btn" onClick={() => setEditando(true)}>
                Editar
              </button>
              <button className="btn btn-perigo" onClick={confirmarExclusao}>
                Excluir
              </button>
            </div>
            <Aviso>{erroExclusao}</Aviso>
          </>
        )}
      </section>

      <section className="bloco">
        <h2>Veículos</h2>
        {veiculos.length === 0 && !novoVeiculo && <p className="vazio">Nenhum veículo cadastrado.</p>}
        {veiculos.length > 0 && (
          <table className="tabela">
            <tbody>
              {veiculos.map((v) => (
                <tr key={v._id}>
                  <td>
                    <Placa valor={v.placa} />
                  </td>
                  <td>
                    {v.marca} {v.modelo}
                  </td>
                  <td>{v.ano ?? '—'}</td>
                  <td>{v.cor ?? '—'}</td>
                  <td className="dir mono">{km(v.km)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {novoVeiculo ? (
          <FormVeiculo IdCliente={cliente._id} onSalvo={() => setNovoVeiculo(false)} onCancelar={() => setNovoVeiculo(false)} />
        ) : (
          <div className="acoes esquerda">
            <button className="btn" onClick={() => setNovoVeiculo(true)}>
              + Veículo
            </button>
          </div>
        )}
      </section>

      <section className="bloco">
        <h2>Histórico de serviços</h2>
        {ordens.length === 0 ? (
          <p className="vazio">Ainda não passou pela oficina.</p>
        ) : (
          <table className="tabela clicavel">
            <thead>
              <tr>
                <th>OS</th>
                <th>Data</th>
                <th>Veículo</th>
                <th>Situação</th>
                <th className="dir">Total</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((o) => (
                <tr key={o._id} onClick={() => navegar(`/ordens/${o._id}`)}>
                  <td className="mono">{numeroOS(o.numero)}</td>
                  <td>{data(o.createdAt)}</td>
                  <td>
                    <Placa valor={o.veiculo.placa} /> {o.veiculo.modelo}
                  </td>
                  <td>
                    <StatusTag status={o.status} />
                  </td>
                  <td className="dir mono">{moeda(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
