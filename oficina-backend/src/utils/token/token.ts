import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../env'
import { ITokenPayload } from './ITokenPayload'

export const gerarToken = (payload: ITokenPayload) =>
  jwt.sign(payload, env.jwt_secret, { expiresIn: env.jwt_expires_in } as SignOptions)

export const lerToken = (token: string): ITokenPayload => {
  const { IdUsuario, Nome, Papel } = jwt.verify(token, env.jwt_secret) as ITokenPayload
  return { IdUsuario, Nome, Papel }
}

export const tokenDoHeader = (authorization?: string) => (authorization ?? '').split(' ')[1] ?? ''
