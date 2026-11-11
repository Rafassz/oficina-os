import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Usuario } from '../models/Usuario';
import { autenticar, gerarToken } from '../middlewares/auth';
import { HttpError } from '../utils/http-error';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
});

router.post('/login', async (req, res) => {
  const { email, senha } = loginSchema.parse(req.body);

  const usuario = await Usuario.findOne({ email, ativo: true }).select('+senhaHash');
  // mesma mensagem pros dois casos pra não entregar quais e-mails existem
  if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    throw new HttpError(401, 'E-mail ou senha incorretos');
  }

  const token = gerarToken({ id: usuario.id, nome: usuario.nome, papel: usuario.papel });
  res.json({ token, usuario: usuario.toJSON() });
});

router.get('/me', autenticar, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario!.id);
  if (!usuario || !usuario.ativo) throw new HttpError(401, 'Usuário desativado');
  res.json(usuario);
});

export default router;
