import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { useOrdensQuery } from '../store/api';
import { mudouBusca, mudouPagina, mudouStatus, type FiltroStatus } from '../store/filtrosSlice';
import { Carregando, Paginacao, Placa, StatusTag } from '../components/pecas';
import { data, estaAtrasada, moeda, numeroOS } from '../lib/formato';

const ABAS: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: 'abertas', rotulo: 'Em aberto' },
  { valor: 'atrasadas', rotulo: 'Atrasadas' },
  { valor: 'orcamento', rotulo: 'Orçamento' },
  { valor: 'aprovada,em_execucao', rotulo: 'Em serviço' },
  { valor: 'aguardando_peca', rotulo: 'Aguard. peça' },
  { valor: 'pronta', rotulo: 'Prontas' },
  { valor: 'entregue', rotulo: 'Entregues' },
  { valor: '', rotulo: 'Todas' },
];

export default function Ordens() {
  const filtros = useAppSelector((s) => s.filtrosOrdens);
  const dispatch = useAppDispatch();
  const navegar = useNavigate();

  // digita à vontade, só busca quando para de digitar
  const [texto, setTexto] = useState(filtros.busca);
  useEffect(() => {
    const t = setTimeout(() => {
      if (texto !== filtros.busca) dispatch(mudouBusca(texto));
    }, 350);
    return () => clearTimeout(t);
  }, [texto, filtros.busca, dispatch]);

  const { data: resultado, isFetching } = useOrdensQuery({
    status: filtros.status,
    busca: filtros.busca || undefined,
    pagina: filtros.pagina,
  });

  return (
    <>
      <header className="cabecalho">
        <h1>Ordens de serviço</h1>
        <Link to="/ordens/nova" className="btn btn-destaque">
          + Abrir OS
        </Link>
      </header>

      <div className="filtros">
        <div className="abas" role="tablist">
          {ABAS.map((a) => (
            <button
              key={a.valor || 'todas'}
              role="tab"
              aria-selected={filtros.status === a.valor}
              className={filtros.status === a.valor ? 'ativa' : ''}
              onClick={() => dispatch(mudouStatus(a.valor))}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Nº da OS, placa ou cliente"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {!resultado ? (
        <Carregando />
      ) : resultado.itens.length === 0 ? (
        <p className="vazio">Nenhuma OS encontrada com esse filtro.</p>
      ) : (
        <>
          <table className={`tabela clicavel${isFetching ? ' esmaecida' : ''}`}>
            <thead>
              <tr>
                <th>OS</th>
                <th>Placa</th>
                <th>Veículo</th>
                <th>Cliente</th>
                <th>Situação</th>
                <th>Previsão</th>
                <th className="dir">Total</th>
              </tr>
            </thead>
            <tbody>
              {resultado.itens.map((o) => (
                <tr key={o._id} onClick={() => navegar(`/ordens/${o._id}`)}>
                  <td className="mono">{numeroOS(o.numero)}</td>
                  <td>
                    <Placa valor={o.veiculo.placa} />
                  </td>
                  <td>{o.veiculo.modelo}</td>
                  <td>{o.cliente.nome}</td>
                  <td>
                    <StatusTag status={o.status} />
                  </td>
                  <td className={estaAtrasada(o.previsaoEntrega, o.status) ? 'atrasado' : ''}>{data(o.previsaoEntrega)}</td>
                  <td className="dir mono">{o.itens.length ? moeda(o.total) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacao
            pagina={resultado.pagina}
            porPagina={resultado.porPagina}
            total={resultado.total}
            onMudar={(p) => dispatch(mudouPagina(p))}
          />
        </>
      )}
    </>
  );
}
