import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PAPEIS, Usuario } from '../models/Usuario';
import { autenticar, exigirPapel } from '../middlewares/auth';

const router = Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const filtro: Record<string, unknown> = { ativo: true };
  if (typeof req.query.papel === 'string') filtro.papel = req.query.papel;
  res.json(await Usuario.find(filtro).sort({ nome: 1 }));
});

const novoUsuarioSchema = z.object({
  nome: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(6, 'Senha precisa de pelo menos 6 caracteres'),
  papel: z.enum(PAPEIS),
});

router.post('/', exigirPapel('admin'), async (req, res) => {
  const { senha, ...dados } = novoUsuarioSchema.parse(req.body);
  const usuario = await Usuario.create({ ...dados, senhaHash: await bcrypt.hash(senha, 10) });
  res.status(201).json(usuario);
});

export default router;
