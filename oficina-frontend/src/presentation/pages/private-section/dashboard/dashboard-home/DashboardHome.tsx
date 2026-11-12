import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IFiltroStatusOS, IStatusOS } from '../../../../../application/models'
import { useDashboardSummaryService } from '../../../../../use-cases/dashboard-summary'
import { useOrdensService } from '../../../../../use-cases/ordens'
import { data, moeda, numeroOS } from '../../../../../utils/formatters'
import { ROTULO_STATUS, pareceAtrasada } from '../../../../assets/helpers'
import { Carregando, Placa, StatusTag } from '../../../../components'

const ORDEM_FLUXO: IStatusOS[] = ['orcamento', 'aprovada', 'em_execucao', 'aguardando_peca', 'pronta']
const ATUALIZAR_A_CADA_MS = 60_000

export const DashboardHome = () => {
  const { resumo, carregarResumo } = useDashboardSummaryService()
  const { setFiltroStatus } = useOrdensService()
  const navegar = useNavigate()

  useEffect(() => {
    carregarResumo()
    const t = setInterval(carregarResumo, ATUALIZAR_A_CADA_MS)
    return () => clearInterval(t)
  }, [carregarResumo])

  function abrirLista(filtro: IFiltroStatusOS) {
    setFiltroStatus(filtro)
    navegar('/ordens')
  }

  if (!resumo) return <Carregando />

  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long' })

  return (
    <>
      <header className="cabecalho">
        <h1>Painel</h1>
        <span className="sutil">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </header>

      <section className="numeros">
        <button className="numero" onClick={() => abrirLista('abertas')}>
          <span>Carros na oficina</span>
          <strong>{resumo.emAberto}</strong>
        </button>
        <button className={`numero${resumo.atrasadas ? ' numero-alerta' : ''}`} onClick={() => abrirLista('atrasadas')}>
          <span>Passaram da previsão</span>
          <strong>{resumo.atrasadas}</strong>
        </button>
        <button className="numero" onClick={() => abrirLista('pronta')}>
          <span>Prontos p/ retirar</span>
          <strong>{resumo.porStatus.pronta ?? 0}</strong>
        </button>
        <div className="numero">
          <span>Faturado em {mes}</span>
          <strong>{moeda(resumo.faturamentoMes)}</strong>
          <small>
            {resumo.entreguesMes} OS · ticket médio {moeda(resumo.ticketMedio)}
          </small>
        </div>
      </section>

      <div className="duas-colunas">
        <section className="bloco">
          <h2>Onde estão os carros</h2>
          <ul className="fluxo">
            {ORDEM_FLUXO.map((s) => {
              const qtd = resumo.porStatus[s] ?? 0
              const pct = resumo.emAberto ? (qtd / resumo.emAberto) * 100 : 0
              return (
                <li key={s}>
                  <span>{ROTULO_STATUS[s]}</span>
                  <div className="barra">
                    <div className={`barra-${s}`} style={{ width: `${pct}%` }} />
                  </div>
                  <b>{qtd}</b>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="bloco">
          <h2>Próximas entregas</h2>
          {resumo.proximasEntregas.length === 0 ? (
            <p className="vazio">Nenhuma OS com previsão de entrega.</p>
          ) : (
            <table className="tabela compacta">
              <tbody>
                {resumo.proximasEntregas.map((o) => (
                  <tr key={o._id}>
                    <td className={pareceAtrasada(o.previsaoEntrega, o.status) ? 'atrasado' : ''}>{data(o.previsaoEntrega)}</td>
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
  )
}
