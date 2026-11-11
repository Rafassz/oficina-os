import { Router } from 'express';
import { z } from 'zod';
import { Veiculo } from '../models/Veiculo';
import { Cliente } from '../models/Cliente';
import { autenticar } from '../middlewares/auth';
import { naoEncontrado } from '../utils/http-error';
import { normalizarPlaca } from '../utils/texto';
import { objectId, placa } from '../utils/validacao';

const router = Router();
router.use(autenticar);

const anoAtual = new Date().getFullYear();

const veiculoSchema = z.object({
  cliente: objectId,
  placa,
  marca: z.string().trim().min(2),
  modelo: z.string().trim().min(1),
  ano: z.number().int().min(1950).max(anoAtual + 1).optional(),
  cor: z.string().trim().optional(),
  km: z.number().int().min(0).optional(),
});

// Busca por placa: é o que o atendente digita quando o carro encosta no portão.
router.get('/', async (req, res) => {
  const termo = typeof req.query.placa === 'string' ? normalizarPlaca(req.query.placa) : '';
  if (!termo) {
    res.json([]);
    return;
  }
  const veiculos = await Veiculo.find({ placa: { $regex: `^${termo}` } })
    .populate('cliente', 'nome telefone')
    .limit(10);
  res.json(veiculos);
});

router.post('/', async (req, res) => {
  const dados = veiculoSchema.parse(req.body);
  if (!(await Cliente.exists({ _id: dados.cliente }))) throw naoEncontrado('Cliente');
  const veiculo = await Veiculo.create(dados);
  res.status(201).json(veiculo);
});

router.put('/:id', async (req, res) => {
  const dados = veiculoSchema.omit({ cliente: true }).partial().parse(req.body);
  const veiculo = await Veiculo.findByIdAndUpdate(req.params.id, dados, { new: true, runValidators: true });
  if (!veiculo) throw naoEncontrado('Veículo');
  res.json(veiculo);
});

export default router;
