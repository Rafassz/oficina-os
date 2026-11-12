import cors from 'cors'
import express from 'express'
import {
  authenticationRoutes,
  clienteRoutes,
  dashboardRoutes,
  ordemServicoRoutes,
  usuarioRoutes,
  veiculoRoutes,
} from './application'
import { env, setupEnv, setupMongoDB } from './utils'

// INICIALIZAÇÃO DO BACKEND

const startApp = async () => {
  setupEnv()

  console.log('OFICINA BACKEND STARTED')
  console.log('\x1b[33m%s\x1b[0m', 'Running in dev mode?', env.dev_mode ? 'Yes' : 'No')

  try {
    await setupMongoDB()
  } catch (error) {
    console.error(`Não consegui conectar em ${env.mongo_uri}. O MongoDB está rodando?`)
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }

  // Express app setup
  const app = express()
  app.use(express.json({ limit: '200kb' }))
  app.use(cors({ origin: env.web_origin }))

  // Routes setup
  app.get('/api/saude', (_req, res) => {
    res.json({ ok: true })
  })
  app.use('/api/auth', authenticationRoutes)
  app.use('/api/usuarios', usuarioRoutes)
  app.use('/api/clientes', clienteRoutes)
  app.use('/api/veiculos', veiculoRoutes)
  app.use('/api/ordens', ordemServicoRoutes)
  app.use('/api/painel', dashboardRoutes)

  app.use('/api', (req, res) => {
    res.status(404).json({ type: 'NotFoundError', message: `Rota ${req.method} ${req.path} não existe` })
  })

  // Start server
  app.listen(env.server_port, () => {
    console.log('\x1b[33m%s\x1b[0m', 'Server is running on port', env.server_port)
  })
}

startApp()
