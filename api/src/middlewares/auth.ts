import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Papel } from '../models/Usuario';
import { HttpError } from '../utils/http-error';

interface PayloadToken {
  sub: string;
  nome: string;
  papel: Papel;
}

export function gerarToken(usuario: { id: string; nome: string; papel: Papel }) {
  const payload: PayloadToken = { sub: usuario.id, nome: usuario.nome, papel: usuario.papel };
  // 12h cobre um expediente inteiro sem pedir login de novo
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Faça login para continuar');
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as PayloadToken;
    req.usuario = { id: payload.sub, nome: payload.nome, papel: payload.papel };
    next();
  } catch {
    throw new HttpError(401, 'Sessão expirada, entre novamente');
  }
}

export function exigirPapel(...papeis: Papel[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario || !papeis.includes(req.usuario.papel)) {
      throw new HttpError(403, 'Seu usuário não tem permissão para isso');
    }
    next();
  };
}
