import 'dotenv/config';

const producao = process.env.NODE_ENV === 'production';

if (producao && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Configure o .env antes de subir em produção.');
}

export const env = {
  producao,
  porta: Number(process.env.PORT ?? 3333),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/oficina',
  jwtSecret: process.env.JWT_SECRET ?? 'segredo-de-desenvolvimento',
  origemWeb: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
};
