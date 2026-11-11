import { Router } from 'express';
import { z } from 'zod';
import { Cliente } from '../models/Cliente';
import { Veiculo } from '../models/Veiculo';
import { OrdemServico } from '../models/OrdemServico';
import { autenticar } from '../middlewares/auth';
import { HttpError, naoEncontrado } from '../utils/http-error';
import { escaparRegex, somenteDigitos } from '../utils/texto';
import { paginacao } from '../utils/validacao';

const router = Router();
router.use(autenticar);

const clienteSchema = z.object({
  nome: z.string().trim().min(3, 'Nome muito curto'),
  telefone: z
    .string()
    .transform(somenteDigitos)
    .refine((t) => t.length === 10 || t.length === 11, 'Telefone deve ter DDD + número'),
  documento: z
    .string()
    .transform(somenteDigitos)
    .refine((d) => d === '' || d.length === 11 || d.length === 14, 'CPF/CNPJ incompleto')
    .optional(),
  email: z.string().trim().email('E-mail inválido').or(z.literal('')).optional(),
  observacoes: z.string().max(500).optional(),
});

router.get('/', async (req, res) => {
  const { pagina, porPagina } = paginacao.parse(req.query);
  const busca = typeof req.query.busca === 'string' ? req.query.busca.trim() : '';

  const filtro: Record<string, unknown> = {};
  if (busca) {
    const digitos = somenteDigitos(busca);
    filtro.$or = [
      { nome: { $regex: escaparRegex(busca), $options: 'i' } },
      ...(digitos.length >= 3 ? [{ telefone: { $regex: digitos } }, { documento: { $regex: digitos } }] : []),
    ];
  }

  const [itens, total] = await Promise.all([
    Cliente.find(filtro)
      .sort({ nome: 1 })
      .skip((pagina - 1) * porPagina)
      .limit(porPagina),
    Cliente.countDocuments(filtro),
  ]);

  res.json({ itens, total, pagina, porPagina });
});

router.get('/:id', async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);
  if (!cliente) throw naoEncontrado('Cliente');

  const [veiculos, ordens] = await Promise.all([
    Veiculo.find({ cliente: cliente._id }).sort({ createdAt: -1 }),
    OrdemServico.find({ cliente: cliente._id })
      .select('numero status veiculo itens desconto createdAt entregueEm')
      .populate('veiculo', 'placa modelo')
      .sort({ numero: -1 })
      .limit(30),
  ]);

  res.json({ cliente, veiculos, ordens });
});

router.post('/', async (req, res) => {
  const dados = clienteSchema.parse(req.body);
  const cliente = await Cliente.create(limparVazios(dados));
  res.status(201).json(cliente);
});

router.put('/:id', async (req, res) => {
  const dados = clienteSchema.partial().parse(req.body);
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, limparVazios(dados), {
    new: true,
    runValidators: true,
  });
  if (!cliente) throw naoEncontrado('Cliente');
  res.json(cliente);
});

router.delete('/:id', async (req, res) => {
  const temOrdens = await OrdemServico.exists({ cliente: req.params.id });
  if (temOrdens) {
    throw new HttpError(409, 'Cliente tem ordens de serviço registradas e não pode ser excluído');
  }
  const cliente = await Cliente.findByIdAndDelete(req.params.id);
  if (!cliente) throw naoEncontrado('Cliente');
  await Veiculo.deleteMany({ cliente: cliente._id });
  res.status(204).end();
});

// "" vindo do formulário vira undefined, senão o índice único de documento reclama
function limparVazios<T extends Record<string, unknown>>(obj: T) {
  const saida: Record<string, unknown> = {};
  const remover: Record<string, 1> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === '') remover[k] = 1;
    else if (v !== undefined) saida[k] = v;
  }
  return Object.keys(remover).length ? { ...saida, $unset: remover } : saida;
}

export default router;
