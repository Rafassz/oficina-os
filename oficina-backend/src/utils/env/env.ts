import * as dotenv from 'dotenv'
import { IEnv } from './IEnv'
dotenv.config()

export const env: IEnv = {
  dev_mode: process.env.DEV_MODE === 'true',
  server_port: Number(process.env.SERVER_PORT ?? 3333),
  mongo_uri: String(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/oficina'),
  jwt_secret: String(process.env.JWT_SECRET ?? ''),
  jwt_expires_in: String(process.env.JWT_EXPIRES_IN ?? '12h'),
  web_origin: String(process.env.WEB_ORIGIN ?? 'http://localhost:5173'),
}
