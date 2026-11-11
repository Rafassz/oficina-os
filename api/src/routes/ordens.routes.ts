import { Router } from 'express';
import { z } from 'zod';
import { OrdemServico, subtotalItens } from '../models/OrdemServico';
import { Veiculo } from '../models/Veiculo';
import { Cliente } from '../models/Cliente';
import { proximoNumero } from '../models/Contador';
import { autenticar } from '../middlewares/auth';
import {
  STATUS_COM_ITENS_TRAVADOS,
  STATUS_FINALIZADOS,
  STATUS_OS,
  StatusOS,
  podeMudar,
  proximosStatus,
} from '../domain/status-os';
import { HttpError, naoEncontrado } from '../utils/http-error';
import { escaparRegex, normalizarPlaca } from '../utils/texto';
import { objectId, paginacao } from '../utils/validacao';

const router = Router();
router.use(autenticar);

const itemSchema = z.object({
  tipo: z.enum(['peca', 'servico']),
  descricao: z.string().trim().min(2, 'Descreva o item').max(120),
  quantidade: z.number().positive('Quantidade deve ser maior que zero').max(999),
  valorUnitario: z.number().int().min(0), // centavos
});

const novaOrdemSchema = z.object({
  cliente: objectId,
  veiculo: objectId,
  kmEntrada: z.number().int().min(0).optional(),
  relato: z.string().trim().min(3, 'Descreva o que o cliente relatou').max(1000),
  previsaoEntrega: z.coerce.date().optional(),
  mecanico: objectId.optional(),
});

const edicaoSchema = z.object({
  relato: z.string().trim().min(3).max(1000).optional(),
  diagnostico: z.string().trim().max(2000).optional(),
  itens: z.array(itemSchema).max(60).optional(),
  desconto: z.number().int().min(0).optional(),
  previsaoEntrega: z.coerce.date().nullable().optional(),
  mecanico: objectId.nullable().optional(),
});

const mudancaStatusSchema = z.object({
  status: z.enum(STATUS_OS),
  obs: z.string().trim().max(300).optional(),
});

const POPULAR = [
  { path: 'cliente', select: 'nome telefone' },
  { path: 'veiculo', select: 'placa marca modelo ano cor' },
  { path: 'mecanico', select: 'nome' },
];

function comAcoes(ordem: InstanceType<typeof OrdemServico>) {
  return { ...ordem.toJSON(), proximosStatus: proximosStatus(ordem.status as StatusOS) };
}

router.get('/', async (req, res) => {
  const { pagina, porPagina } = paginacao.parse(req.query);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const busca = typeof req.query.busca === 'string' ? req.query.busca.trim() : '';

  const filtro: Record<string, unknown> = {};

  if (status === 'abertas') {
    filtro.status = { $nin: STATUS_FINALIZADOS };
  } else if (status === 'atrasadas') {
    filtro.status = { $nin: [...STATUS_FINALIZADOS, 'pronta'] };
    filtro.previsaoEntrega = { $lt: new Date() };
  } else if (status) {
    filtro.status = { $in: status.split(',').filter((s) => (STATUS_OS as readonly string[]).includes(s)) };
  }

  if (busca) {
    // número da OS, placa ou nome do cliente — o atendente não precisa escolher
    const ou: Record<string, unknown>[] = [];
    if (/^\d+$/.test(busca)) ou.push({ numero: Number(busca) });

    const placa = normalizarPlaca(busca);
    if (placa.length >= 3) {
      const veiculos = await Veiculo.find({ placa: { $regex: escaparRegex(placa) } }).select('_id');
      if (veiculos.length) ou.push({ veiculo: { $in: veiculos.map((v) => v._id) } });
    }

    const clientes = await Cliente.find({ nome: { $regex: escaparRegex(busca), $options: 'i' } }).select('_id');
    if (clientes.length) ou.push({ cliente: { $in: clientes.map((c) => c._id) } });

    filtro.$or = ou.length ? ou : [{ _id: null }];
  }

  const [itens, total] = await Promise.all([
    OrdemServico.find(filtro)
      .select('-historico')
      .populate(POPULAR)
      .sort({ numero: -1 })
      .skip((pagina - 1) * porPagina)
      .limit(porPagina),
    OrdemServico.countDocuments(filtro),
  ]);

  res.json({ itens, total, pagina, porPagina });
});

router.get('/:id', async (req, res) => {
  const ordem = await OrdemServico.findById(req.params.id)
    .populate(POPULAR)
    .populate('historico.por', 'nome');
  if (!ordem) throw naoEncontrado('Ordem de serviço');
  res.json(comAcoes(ordem));
});

router.post('/', async (req, res) => {
  const dados = novaOrdemSchema.parse(req.body);

  const veiculo = await Veiculo.findById(dados.veiculo);
  if (!veiculo) throw naoEncontrado('Veículo');
  if (!veiculo.cliente.equals(dados.cliente)) {
    throw new HttpError(400, 'Esse veículo não pertence ao cliente selecionado');
  }

  const jaAberta = await OrdemServico.findOne({ veiculo: veiculo._id, status: { $nin: STATUS_FINALIZADOS } }).select(
    'numero',
  );
  if (jaAberta) {
    throw new HttpError(409, `O veículo ${veiculo.placa} já está na OS nº ${jaAberta.numero}, que ainda não foi fechada`);
  }

  if (dados.kmEntrada !== undefined && dados.kmEntrada < (veiculo.km ?? 0)) {
    throw new HttpError(400, `KM informado é menor que o último registrado (${veiculo.km})`);
  }

  const ordem = await OrdemServico.create({
    ...dados,
    numero: await proximoNumero('os'),
    historico: [{ status: 'orcamento', por: req.usuario!.id, obs: 'Veículo recebido' }],
  });

  if (dados.kmEntrada !== undefined) {
    veiculo.km = dados.kmEntrada;
    await veiculo.save();
  }

  await ordem.populate(POPULAR);
  res.status(201).json(comAcoes(ordem));
});

router.put('/:id', async (req, res) => {
  const dados = edicaoSchema.parse(req.body);
  const ordem = await OrdemServico.findById(req.params.id);
  if (!ordem) throw naoEncontrado('Ordem de serviço');

  const status = ordem.status as StatusOS;
  if (STATUS_FINALIZADOS.includes(status)) {
    throw new HttpError(409, 'OS finalizada não pode ser alterada');
  }
  if ((dados.itens || dados.desconto !== undefined) && STATUS_COM_ITENS_TRAVADOS.includes(status)) {
    throw new HttpError(409, 'Os itens não podem mudar depois que a OS foi marcada como pronta');
  }

  const itens = dados.itens ?? ordem.itens;
  const desconto = dados.desconto ?? ordem.desconto;
  if (desconto > subtotalItens(itens)) {
    throw new HttpError(400, 'Desconto maior que o valor da OS');
  }

  ordem.set(dados);
  await ordem.save();
  await ordem.populate(POPULAR);
  await ordem.populate('historico.por', 'nome');
  res.json(comAcoes(ordem));
});

router.post('/:id/status', async (req, res) => {
  const { status: novo, obs } = mudancaStatusSchema.parse(req.body);
  const ordem = await OrdemServico.findById(req.params.id);
  if (!ordem) throw naoEncontrado('Ordem de serviço');

  const atual = ordem.status as StatusOS;
  if (!podeMudar(atual, novo)) {
    throw new HttpError(409, `Não é possível passar de "${atual}" para "${novo}"`);
  }
  if (novo === 'aprovada' && ordem.itens.length === 0) {
    throw new HttpError(400, 'Inclua ao menos um item no orçamento antes de aprovar');
  }
  if (novo === 'cancelada' && !obs) {
    throw new HttpError(400, 'Informe o motivo do cancelamento');
  }

  ordem.status = novo;
  ordem.historico.push({ status: novo, por: req.usuario!.id, obs, em: new Date() });
  if (novo === 'entregue') ordem.entregueEm = new Date();

  await ordem.save();
  await ordem.populate(POPULAR);
  await ordem.populate('historico.por', 'nome');
  res.json(comAcoes(ordem));
});

export default router;
