import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IItemOS, IOrdemServico, IStatusOS } from '../../../../../../application/models'
import {
  ILinhaItem,
  itensParaLinhas,
  linhasParaItens,
  novaChaveLinha,
  previaTotais,
  subtotalLinha,
  useOrdensService,
} from '../../../../../../use-cases/ordens'
import { useUsuariosService } from '../../../../../../use-cases/usuarios'
import {
  centavosParaTexto,
  data,
  dataHora,
  km,
  lerMoeda,
  linkWhatsApp,
  moeda,
  numeroOS,
  paraInputData,
  telefone,
} from '../../../../../../utils/formatters'
import { ROTULO_STATUS, pareceAtrasada, rotuloAcao } from '../../../../../assets/helpers'
import { Aviso, Placa, StatusTag } from '../../../../../components'

const STATUS_TRAVADOS: IStatusOS[] = ['pronta', 'entregue', 'cancelada']

export const EditorOrdem = ({ ordem }: { ordem: IOrdemServico }) => {
  const { salvarOrdem, mudarStatus } = useOrdensService()
  const { mecanicos, carregarMecanicos } = useUsuariosService()

  useEffect(() => {
    carregarMecanicos()
  }, [carregarMecanicos])

  const travada = STATUS_TRAVADOS.includes(ordem.status)
  const finalizada = ordem.status === 'entregue' || ordem.status === 'cancelada'

  const [linhas, setLinhas] = useState(() => itensParaLinhas(ordem.itens))
  const [diagnostico, setDiagnostico] = useState(ordem.diagnostico)
  const [desconto, setDesconto] = useState(ordem.desconto ? centavosParaTexto(ordem.desconto) : '')
  const [previsao, setPrevisao] = useState(paraInputData(ordem.previsaoEntrega))
  const [mecanico, setMecanico] = useState(ordem.mecanico?._id ?? '')
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)
  const [erroStatus, setErroStatus] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const itensEditados = useMemo(() => linhasParaItens(linhas), [linhas])
  const totais = useMemo(() => previaTotais(itensEditados, lerMoeda(desconto)), [itensEditados, desconto])

  const alterado =
    JSON.stringify(itensEditados) !== JSON.stringify(ordem.itens) ||
    diagnostico !== ordem.diagnostico ||
    totais.desconto !== ordem.desconto ||
    previsao !== paraInputData(ordem.previsaoEntrega) ||
    mecanico !== (ordem.mecanico?._id ?? '')

  function atualizarLinha(chave: string, campo: keyof ILinhaItem, valor: string) {
    setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)))
  }

  function novaLinha(tipo: IItemOS['tipo']) {
    // a chave sai daqui de fora: o updater do setState roda depois
    const chave = novaChaveLinha()
    setLinhas((ls) => [...ls, { chave, tipo, descricao: '', quantidade: '1', valor: '' }])
  }

  async function salvar() {
    setOcupado(true)
    const resultado = await salvarOrdem(ordem._id, {
      diagnostico,
      previsaoEntrega: previsao || null,
      mecanico: mecanico || null,
      ...(travada ? {} : { itens: itensEditados, desconto: totais.desconto }),
    })
    setOcupado(false)
    setErroSalvar(resultado.ok ? null : resultado.mensagem)
  }

  async function avancar(status: IStatusOS) {
    let obs: string | undefined
    if (status === 'cancelada') {
      const motivo = window.prompt('Motivo do cancelamento:')
      if (!motivo) return
      obs = motivo
    }
    if (status === 'aguardando_peca') {
      obs = window.prompt('Qual peça está faltando? (opcional)') || undefined
    }
    if (status === 'entregue' && !window.confirm(`Confirmar entrega da OS ${numeroOS(ordem.numero)} — total ${moeda(ordem.total)}?`)) {
      return
    }
    if (alterado && !window.confirm('Há alterações não salvas que serão descartadas. Continuar?')) return

    setOcupado(true)
    const resultado = await mudarStatus(ordem._id, status, obs)
    setOcupado(false)
    setErroStatus(resultado.ok ? null : resultado.mensagem)
  }

  const mensagemPronta = `Olá ${ordem.cliente.nome.split(' ')[0]}, aqui é da Oficina Prado. Seu ${ordem.veiculo.modelo} (${ordem.veiculo.placa}) está pronto para retirada. Valor total: ${moeda(ordem.total)}.`

  return (
    <div className="os">
      {/* cabeçalho que só aparece no papel */}
      <div className="so-impressao timbre">
        <strong>Oficina Prado — mecânica &amp; elétrica</strong>
        <span>Ordem de serviço emitida em {dataHora(new Date().toISOString())}</span>
      </div>

      <header className="cabecalho">
        <div>
          <h1>
            OS <span className="mono">{numeroOS(ordem.numero)}</span>
          </h1>
          <span className="sutil">aberta em {dataHora(ordem.createdAt)}</span>
        </div>
        <StatusTag status={ordem.status} />
        <div className="espaco" />
        <div className="acoes nao-imprimir">
          {ordem.status === 'pronta' && (
            <a className="btn" href={linkWhatsApp(ordem.cliente.telefone, mensagemPronta)} target="_blank" rel="noreferrer">
              Avisar no WhatsApp
            </a>
          )}
          <button className="btn" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </header>

      {ordem.proximosStatus.length > 0 && (
        <div className="barra-status nao-imprimir">
          <span className="sutil">Próximo passo:</span>
          {/* o primeiro é o caminho normal; os outros são desvios */}
          {ordem.proximosStatus.map((s, i) => (
            <button
              key={s}
              className={`btn ${s === 'cancelada' ? 'btn-perigo' : i === 0 ? 'btn-destaque' : ''}`}
              disabled={ocupado}
              onClick={() => avancar(s)}
            >
              {rotuloAcao(ordem.status, s)}
            </button>
          ))}
        </div>
      )}
      <Aviso>{erroStatus}</Aviso>

      <div className="os-grade">
        <section className="bloco">
          <h2>Veículo</h2>
          <Placa valor={ordem.veiculo.placa} grande />
          <p>
            {ordem.veiculo.marca} {ordem.veiculo.modelo}
            {ordem.veiculo.ano && ` · ${ordem.veiculo.ano}`}
            {ordem.veiculo.cor && ` · ${ordem.veiculo.cor}`}
          </p>
          <p className="sutil">Entrada com {km(ordem.kmEntrada)}</p>
        </section>

        <section className="bloco">
          <h2>Cliente</h2>
          <p>
            <Link to={`/clientes/${ordem.cliente._id}`}>{ordem.cliente.nome}</Link>
          </p>
          <p className="sutil">{telefone(ordem.cliente.telefone)}</p>
        </section>

        <section className="bloco">
          <h2>Prazo e responsável</h2>
          <div className="grade">
            <label>
              Previsão
              <input
                type="date"
                value={previsao}
                onChange={(e) => setPrevisao(e.target.value)}
                disabled={finalizada}
                className={pareceAtrasada(ordem.previsaoEntrega, ordem.status) ? 'atrasado' : ''}
              />
            </label>
            <label>
              Mecânico
              <select value={mecanico} onChange={(e) => setMecanico(e.target.value)} disabled={finalizada}>
                <option value="">—</option>
                {mecanicos.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {ordem.entregueEm && <p className="sutil">Entregue em {dataHora(ordem.entregueEm)}</p>}
        </section>
      </div>

      <section className="bloco">
        <h2>Relato do cliente</h2>
        <p className="relato">{ordem.relato}</p>

        <h2>Diagnóstico</h2>
        {finalizada ? (
          <p className="relato">{ordem.diagnostico || '—'}</p>
        ) : (
          <textarea
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            rows={3}
            placeholder="O que o mecânico encontrou"
          />
        )}
      </section>

      <section className="bloco">
        <h2>Peças e serviços</h2>
        {travada && ordem.status !== 'cancelada' && (
          <p className="sutil nao-imprimir">Valores travados: a OS já foi marcada como pronta.</p>
        )}

        <table className="tabela itens">
          <thead>
            <tr>
              <th style={{ width: '6.5rem' }}>Tipo</th>
              <th>Descrição</th>
              <th className="dir" style={{ width: '5rem' }}>
                Qtd
              </th>
              <th className="dir" style={{ width: '8rem' }}>
                Unitário
              </th>
              <th className="dir" style={{ width: '8rem' }}>
                Subtotal
              </th>
              {!travada && <th className="nao-imprimir" style={{ width: '2rem' }} />}
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr>
                <td colSpan={6} className="vazio">
                  Nenhum item lançado ainda.
                </td>
              </tr>
            )}
            {linhas.map((l) =>
              travada ? (
                <tr key={l.chave}>
                  <td>{l.tipo === 'peca' ? 'Peça' : 'Serviço'}</td>
                  <td>{l.descricao}</td>
                  <td className="dir mono">{l.quantidade}</td>
                  <td className="dir mono">{l.valor}</td>
                  <td className="dir mono">{moeda(subtotalLinha(l))}</td>
                </tr>
              ) : (
                <tr key={l.chave}>
                  <td>
                    <select value={l.tipo} onChange={(e) => atualizarLinha(l.chave, 'tipo', e.target.value)}>
                      <option value="peca">Peça</option>
                      <option value="servico">Serviço</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={l.descricao}
                      onChange={(e) => atualizarLinha(l.chave, 'descricao', e.target.value)}
                      placeholder={l.tipo === 'peca' ? 'Ex.: Pastilha de freio dianteira' : 'Ex.: Mão de obra troca de pastilhas'}
                      maxLength={120}
                    />
                  </td>
                  <td>
                    <input
                      className="dir mono"
                      value={l.quantidade}
                      inputMode="decimal"
                      onChange={(e) => atualizarLinha(l.chave, 'quantidade', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="dir mono"
                      value={l.valor}
                      inputMode="decimal"
                      placeholder="0,00"
                      onChange={(e) => atualizarLinha(l.chave, 'valor', e.target.value)}
                    />
                  </td>
                  <td className="dir mono">{moeda(subtotalLinha(l))}</td>
                  <td className="nao-imprimir">
                    <button
                      className="remover"
                      title="Remover item"
                      onClick={() => setLinhas((ls) => ls.filter((x) => x.chave !== l.chave))}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {!travada && (
          <div className="acoes esquerda nao-imprimir">
            <button className="btn" onClick={() => novaLinha('peca')}>
              + Peça
            </button>
            <button className="btn" onClick={() => novaLinha('servico')}>
              + Serviço
            </button>
          </div>
        )}

        <dl className="totais">
          <dt>Peças</dt>
          <dd>{moeda(totais.pecas)}</dd>
          <dt>Mão de obra</dt>
          <dd>{moeda(totais.servicos)}</dd>
          <dt>Desconto</dt>
          <dd>
            {travada ? (
              `− ${moeda(totais.desconto)}`
            ) : (
              <input
                className="dir mono"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
              />
            )}
          </dd>
          <dt className="total">Total</dt>
          <dd className="total">{moeda(totais.total)}</dd>
        </dl>
      </section>

      {!finalizada && (
        <div className="rodape-salvar nao-imprimir">
          <Aviso>{erroSalvar}</Aviso>
          {!alterado && <span className="sutil">Tudo salvo</span>}
          <button className="btn btn-destaque" disabled={!alterado || ocupado} onClick={salvar}>
            {ocupado ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      )}

      <div className="so-impressao assinaturas">
        <div>Autorizo a execução dos serviços acima</div>
        <div>Recebi o veículo nas condições descritas</div>
      </div>

      <section className="bloco nao-imprimir">
        <h2>Histórico</h2>
        <ol className="historico">
          {[...ordem.historico].reverse().map((h, i) => (
            <li key={i}>
              <time>{dataHora(h.em)}</time>
              <span>
                <b>{ROTULO_STATUS[h.status]}</b>
                {h.por && <> · {h.por.nome}</>}
                {h.obs && <em> — {h.obs}</em>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="sutil nao-imprimir">
        Previsão atual: {data(ordem.previsaoEntrega)} · última alteração {dataHora(ordem.updatedAt)}
      </p>
    </div>
  )
}
