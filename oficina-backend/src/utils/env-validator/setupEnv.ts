import { env } from '../env'

// Falha logo na subida se faltar algo essencial, em vez de quebrar no meio de uma requisição
export const setupEnv = () => {
  const faltando: string[] = []
  if (!env.jwt_secret) faltando.push('JWT_SECRET')
  if (!env.mongo_uri) faltando.push('MONGO_URI')

  if (faltando.length) {
    throw new Error(`Variáveis de ambiente não configuradas: ${faltando.join(', ')}. Veja o .env.example`)
  }
}
