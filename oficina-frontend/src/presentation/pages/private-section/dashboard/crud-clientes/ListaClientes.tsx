import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientesService } from '../../../../../use-cases/clientes'
import { data, documento, telefone } from '../../../../../utils/formatters'
import { Carregando, Paginacao } from '../../../../components'
import { FormCliente } from './form-cliente'

const ESPERA_DIGITACAO_MS = 300

export const ListaClientes = () => {
  const navegar = useNavigate()
  const { lista, carregandoLista, filtros, carregarClientes, setBusca, setPagina } = useClientesService()
  const [texto, setTexto] = useState(filtros.busca)
  const [cadastrando, setCadastrando] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (texto.trim() !== filtros.busca) setBusca(texto.trim())
    }, ESPERA_DIGITACAO_MS)
    return () => clearTimeout(t)
  }, [texto, filtros.busca, setBusca])

  useEffect(() => {
    carregarClientes()
  }, [carregarClientes])

  return (
    <>
      <header className="cabecalho">
        <h1>Clientes</h1>
        {!cadastrando && (
          <button className="btn btn-destaque" onClick={() => setCadastrando(true)}>
            + Novo cliente
          </button>
        )}
      </header>

      {cadastrando && (
        <section className="bloco">
          <h2>Novo cliente</h2>
          <FormCliente onSalvo={(c) => navegar(`/clientes/${c._id}`)} onCancelar={() => setCadastrando(false)} />
        </section>
      )}

      <div className="filtros">
        <input type="search" placeholder="Nome, telefone ou CPF/CNPJ" value={texto} onChange={(e) => setTexto(e.target.value)} />
        {lista && <span className="sutil">{lista.total} cadastrados</span>}
      </div>

      {!lista ? (
        <Carregando />
      ) : lista.itens.length === 0 ? (
        <p className="vazio">Nenhum cliente encontrado.</p>
      ) : (
        <>
          <table className={`tabela clicavel${carregandoLista ? ' esmaecida' : ''}`}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>CPF / CNPJ</th>
                <th>Cliente desde</th>
              </tr>
            </thead>
            <tbody>
              {lista.itens.map((c) => (
                <tr key={c._id} onClick={() => navegar(`/clientes/${c._id}`)}>
                  <td>{c.nome}</td>
                  <td className="mono">{telefone(c.telefone)}</td>
                  <td className="mono">{documento(c.documento) || '—'}</td>
                  <td>{data(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacao pagina={lista.pagina} porPagina={lista.porPagina} total={lista.total} onMudar={setPagina} />
        </>
      )}
    </>
  )
}
