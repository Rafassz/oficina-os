import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientesQuery } from '../store/api';
import FormCliente from '../components/FormCliente';
import { Carregando, Paginacao } from '../components/pecas';
import { data, documento, telefone } from '../lib/formato';

export default function Clientes() {
  const navegar = useNavigate();
  const [texto, setTexto] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cadastrando, setCadastrando] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(texto.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(t);
  }, [texto]);

  const { data: resultado, isFetching } = useClientesQuery({ busca: busca || undefined, pagina });

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
        <input
          type="search"
          placeholder="Nome, telefone ou CPF/CNPJ"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        {resultado && <span className="sutil">{resultado.total} cadastrados</span>}
      </div>

      {!resultado ? (
        <Carregando />
      ) : resultado.itens.length === 0 ? (
        <p className="vazio">Nenhum cliente encontrado.</p>
      ) : (
        <>
          <table className={`tabela clicavel${isFetching ? ' esmaecida' : ''}`}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>CPF / CNPJ</th>
                <th>Cliente desde</th>
              </tr>
            </thead>
            <tbody>
              {resultado.itens.map((c) => (
                <tr key={c._id} onClick={() => navegar(`/clientes/${c._id}`)}>
                  <td>{c.nome}</td>
                  <td className="mono">{telefone(c.telefone)}</td>
                  <td className="mono">{documento(c.documento) || '—'}</td>
                  <td>{data(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacao pagina={pagina} porPagina={resultado.porPagina} total={resultado.total} onMudar={setPagina} />
        </>
      )}
    </>
  );
}
