import { Link, useNavigate } from 'react-router-dom';
import { usePainelQuery } from '../store/api';
import { useAppDispatch } from '../store';
import { mudouStatus, type FiltroStatus } from '../store/filtrosSlice';
import { Carregando, Placa, StatusTag } from '../components/pecas';
import { data, estaAtrasada, moeda, numeroOS } from '../lib/formato';
import { ROTULO_STATUS } from '../lib/status';
import type { StatusOS } from '../types';

const ORDEM_FLUXO: StatusOS[] = ['orcamento', 'aprovada', 'em_execucao', 'aguardando_peca', 'pronta'];

export default function Painel() {
  const { data: painel, isLoading } = usePainelQuery(undefined, { pollingInterval: 60_000 });
  const dispatch = useAppDispatch();
  const navegar = useNavigate();

  function abrirLista(filtro: FiltroStatus) {
    dispatch(mudouStatus(filtro));
    navegar('/ordens');
  }

  if (isLoading || !painel) return <Carregando />;

  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <>
      <header className="cabecalho">
        <h1>Painel</h1>
        <span className="sutil">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </header>

      <section className="numeros">
        <button className="numero" onClick={() => abrirLista('abertas')}>
          <span>Carros na oficina</span>
          <strong>{painel.emAberto}</strong>
        </button>
        <button className={`numero${painel.atrasadas ? ' numero-alerta' : ''}`} onClick={() => abrirLista('atrasadas')}>
          <span>Passaram da previsão</span>
          <strong>{painel.atrasadas}</strong>
        </button>
        <button className="numero" onClick={() => abrirLista('pronta')}>
          <span>Prontos p/ retirar</span>
          <strong>{painel.porStatus.pronta ?? 0}</strong>
        </button>
        <div className="numero">
          <span>Faturado em {mes}</span>
          <strong>{moeda(painel.faturamentoMes)}</strong>
          <small>
            {painel.entreguesMes} OS · ticket médio {moeda(painel.ticketMedio)}
          </small>
        </div>
      </section>

      <div className="duas-colunas">
        <section className="bloco">
          <h2>Onde estão os carros</h2>
          <ul className="fluxo">
            {ORDEM_FLUXO.map((s) => {
              const qtd = painel.porStatus[s] ?? 0;
              const pct = painel.emAberto ? (qtd / painel.emAberto) * 100 : 0;
              return (
                <li key={s}>
                  <span>{ROTULO_STATUS[s]}</span>
                  <div className="barra">
                    <div className={`barra-${s}`} style={{ width: `${pct}%` }} />
                  </div>
                  <b>{qtd}</b>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="bloco">
          <h2>Próximas entregas</h2>
          {painel.proximasEntregas.length === 0 ? (
            <p className="vazio">Nenhuma OS com previsão de entrega.</p>
          ) : (
            <table className="tabela compacta">
              <tbody>
                {painel.proximasEntregas.map((o) => (
                  <tr key={o._id}>
                    <td className={estaAtrasada(o.previsaoEntrega, o.status) ? 'atrasado' : ''}>{data(o.previsaoEntrega)}</td>
                    <td>
                      <Placa valor={o.veiculo.placa} />
                    </td>
                    <td>
                      <Link to={`/ordens/${o._id}`}>
                        OS {numeroOS(o.numero)} · {o.cliente.nome}
                      </Link>
                    </td>
                    <td>
                      <StatusTag status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
