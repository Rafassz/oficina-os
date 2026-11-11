import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import clientesRoutes from './routes/clientes.routes';
import veiculosRoutes from './routes/veiculos.routes';
import ordensRoutes from './routes/ordens.routes';
import painelRoutes from './routes/painel.routes';
import { rotaInexistente, tratarErros } from './middlewares/erros';

export function criarApp() {
  const app = express();

  app.use(cors({ origin: env.origemWeb }));
  app.use(express.json({ limit: '200kb' }));

  app.get('/api/saude', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/veiculos', veiculosRoutes);
  app.use('/api/ordens', ordensRoutes);
  app.use('/api/painel', painelRoutes);

  app.use('/api', rotaInexistente);
  app.use(tratarErros);

  return app;
}
