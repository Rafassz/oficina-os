import mongoose from 'mongoose';
import { env } from './config/env';

export async function conectarBanco(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[db] conectado em ${mongoose.connection.host}/${mongoose.connection.name}`);
}
