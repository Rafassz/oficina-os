import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  mensagemDeErro,
  useEditarOrdemMutation,
  useMudarStatusMutation,
  useOrdemQuery,
  useUsuariosQuery,
} from '../store/api';
import { Aviso, Carregando, Placa, StatusTag } from '../components/pecas';
import {
  centavosParaTexto,
  data,
  dataHora,
  estaAtrasada,
  km,
  lerMoeda,
  linkWhatsApp,
  moeda,
  numeroOS,
  paraInputData,
  telefone,
} from '../lib/formato';
import { ROTULO_STATUS, rotuloAcao } from '../lib/status';
import type { ItemOS, OrdemServico, StatusOS } from '../types';

// Na edição o valor fica como texto ("1.250,00") e só vira centavos ao salvar
interface LinhaItem {
  chave: string;
  tipo: ItemOS['tipo'];
  descricao: string;
  quantidade: string;
  valor: string;
}

const paraLinhas = (itens: ItemOS[]): LinhaItem[] =>
  itens.map((i, idx) => ({
    chave: i._id ?? `l${idx}`,
    tipo: i.tipo,
    descricao: i.descricao,
    quantidade: String(i.quantidade).replace('.', ','),
    valor: centavosParaTexto(i.valorUnitario),
  }));

const paraItens = (linhas: LinhaItem[]): ItemOS[] =>
  linhas
    .filter((l) => l.descricao.trim())
    .map((l) => ({
      tipo: l.tipo,
      descricao: l.descricao.trim(),
      quantidade: Number(l.quantidade.replace(',', '.')) || 0,
      valorUnitario: lerMoeda(l.valor),
    }));

let contadorLinha = 0;

export default function OrdemDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: os, isLoading, error } = useOrdemQuery(id!);

  if (isLoading) return <Carregando />;
  if (!os) return <Aviso>{mensagemDeErro(error) ?? 'OS não encontrada'}</Aviso>;

  // key força remontar o editor quando a OS muda no servidor
  return <Editor key={os.updatedAt} os={os} />;
}

function Editor({ os }: { os: OrdemServico }) {
  const { data: mecanicos } = useUsuariosQuery({ papel: 'mecanico' });
  const [editar, edicao] = useEditarOrdemMutation();
  const [mudarStatus, mudanca] = useMudarStatusMutation();

  const travada = ['pronta', 'entregue', 'cancelada'].includes(os.status);
  const finalizada = os.status === 'entregue' || os.status === 'cancelada';

  const [linhas, setLinhas] = useState(() => paraLinhas(os.itens));
  const [diagnostico, setDiagnostico] = useState(os.diagnostico);
  const [desconto, setDesconto] = useState(os.desconto ? centavosParaTexto(os.desconto) : '');
  const [previsao, setPrevisao] = useState(paraInputData(os.previsaoEntrega));
  const [mecanico, setMecanico] = useState(os.mecanico?._id ?? '');

  const itensEditados = useMemo(() => paraItens(linhas), [linhas]);
  const totais = useMemo(() => {
    const soma = (tipo: ItemOS['tipo']) =>
      itensEditados.filter((i) => i.tipo === tipo).reduce((a, i) => a + Math.round(i.quantidade * i.valorUnitario), 0);
    const pecas = soma('peca');
    const servicos = soma('servico');
    const desc = lerMoeda(desconto);
    return { pecas, servicos, desconto: desc, total: Math.max(0, pecas + servicos - desc) };
  }, [itensEditados, desconto]);

  const alterado =
    JSON.stringify(itensEditados) !== JSON.stringify(os.itens.map(({ _id, ...resto }) => resto)) ||
    diagnostico !== os.diagnostico ||
    totais.desconto !== os.desconto ||
    previsao !== paraInputData(os.previsaoEntrega) ||
    mecanico !== (os.mecanico?._id ?? '');

  function atualizarLinha(chave: string, campo: keyof LinhaItem, valor: string) {
    setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)));
  }

  function novaLinha(tipo: ItemOS['tipo']) {
    // a chave precisa ser calculada aqui fora: o updater do setState roda depois
    const chave = `n${++contadorLinha}`;
    setLinhas((ls) => [...ls, { chave, tipo, descricao: '', quantidade: '1', valor: '' }]);
  }

  async function salvar() {
    try {
      await editar({
        id: os._id,
        diagnostico,
        previsaoEntrega: previsao || null,
        mecanico: mecanico || null,
        ...(travada ? {} : { itens: itensEditados, desconto: totais.desconto }),
      }).unwrap();
    } catch {
      /* Aviso mostra */
    }
  }

  async function avancar(status: StatusOS) {
    let obs: string | undefined;
    if (status === 'cancelada') {
      const motivo = window.prompt('Motivo do cancelamento:');
      if (!motivo) return;
      obs = motivo;
    }
    if (status === 'aguardando_peca') {
      obs = window.prompt('Qual peça está faltando? (opcional)') || undefined;
    }
    if (status === 'entregue' && !window.confirm(`Confirmar entrega da OS ${numeroOS(os.numero)} — total ${moeda(os.total)}?`)) {
      return;
    }
    if (alterado && !window.confirm('Há alterações não salvas que serão descartadas. Continuar?')) return;
    mudarStatus({ id: os._id, status, obs });
  }

  const mensagemPronta = `Olá ${os.cliente.nome.split(' ')[0]}, aqui é da Oficina Prado. Seu ${os.veiculo.modelo} (${os.veiculo.placa}) está pronto para retirada. Valor total: ${moeda(os.total)}.`;

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
            OS <span className="mono">{numeroOS(os.numero)}</span>
          </h1>
          <span className="sutil">aberta em {dataHora(os.createdAt)}</span>
        </div>
        <StatusTag status={os.status} />
        <div className="espaco" />
        <div className="acoes nao-imprimir">
          {os.status === 'pronta' && (
            <a className="btn" href={linkWhatsApp(os.cliente.telefone, mensagemPronta)} target="_blank" rel="noreferrer">
              Avisar no WhatsApp
            </a>
          )}
          <button className="btn" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </header>

      {os.proximosStatus.length > 0 && (
        <div className="barra-status nao-imprimir">
          <span className="sutil">Próximo passo:</span>
          {/* o primeiro é o caminho normal; os outros são desvios */}
          {os.proximosStatus.map((s, i) => (
            <button
              key={s}
              className={`btn ${s === 'cancelada' ? 'btn-perigo' : i === 0 ? 'btn-destaque' : ''}`}
              disabled={mudanca.isLoading}
              onClick={() => avancar(s)}
            >
              {rotuloAcao(os.status, s)}
            </button>
          ))}
        </div>
      )}
      <Aviso>{mensagemDeErro(mudanca.error)}</Aviso>

      <div className="os-grade">
        <section className="bloco">
          <h2>Veículo</h2>
          <Placa valor={os.veiculo.placa} grande />
          <p>
            {os.veiculo.marca} {os.veiculo.modelo}
            {os.veiculo.ano && ` · ${os.veiculo.ano}`}
            {os.veiculo.cor && ` · ${os.veiculo.cor}`}
          </p>
          <p className="sutil">Entrada com {km(os.kmEntrada)}</p>
        </section>

        <section className="bloco">
          <h2>Cliente</h2>
          <p>
            <Link to={`/clientes/${os.cliente._id}`}>{os.cliente.nome}</Link>
          </p>
          <p className="sutil">{telefone(os.cliente.telefone)}</p>
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
                className={estaAtrasada(os.previsaoEntrega, os.status) ? 'atrasado' : ''}
              />
            </label>
            <label>
              Mecânico
              <select value={mecanico} onChange={(e) => setMecanico(e.target.value)} disabled={finalizada}>
                <option value="">—</option>
                {mecanicos?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {os.entregueEm && <p className="sutil">Entregue em {dataHora(os.entregueEm)}</p>}
        </section>
      </div>

      <section className="bloco">
        <h2>Relato do cliente</h2>
        <p className="relato">{os.relato}</p>

        <h2>Diagnóstico</h2>
        {finalizada ? (
          <p className="relato">{os.diagnostico || '—'}</p>
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
        {travada && os.status !== 'cancelada' && (
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
            {linhas.map((l) => {
              const sub = Math.round((Number(l.quantidade.replace(',', '.')) || 0) * lerMoeda(l.valor));
              return travada ? (
                <tr key={l.chave}>
                  <td>{l.tipo === 'peca' ? 'Peça' : 'Serviço'}</td>
                  <td>{l.descricao}</td>
                  <td className="dir mono">{l.quantidade}</td>
                  <td className="dir mono">{l.valor}</td>
                  <td className="dir mono">{moeda(sub)}</td>
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
                  <td className="dir mono">{moeda(sub)}</td>
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
              );
            })}
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
          <Aviso>{mensagemDeErro(edicao.error)}</Aviso>
          {!alterado && <span className="sutil">Tudo salvo</span>}
          <button className="btn btn-destaque" disabled={!alterado || edicao.isLoading} onClick={salvar}>
            {edicao.isLoading ? 'Salvando…' : 'Salvar alterações'}
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
          {[...os.historico].reverse().map((h, i) => (
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
        Previsão atual: {data(os.previsaoEntrega)} · última alteração {dataHora(os.updatedAt)}
      </p>
    </div>
  );
}
