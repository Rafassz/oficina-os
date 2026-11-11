import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http-error';

export function rotaInexistente(req: Request, res: Response) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.path} não existe` });
}

// Express 5 já repassa erros de handlers async pra cá, sem precisar de try/catch em cada rota.
export function tratarErros(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ erro: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const campos: Record<string, string> = {};
    for (const issue of err.issues) {
      campos[issue.path.join('.') || '_'] = issue.message;
    }
    res.status(400).json({ erro: 'Dados inválidos', campos });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ erro: `Identificador inválido: ${String(err.value)}` });
    return;
  }

  if (typeof err === 'object' && err && 'code' in err && err.code === 11000) {
    const chave = Object.keys((err as { keyValue?: object }).keyValue ?? {})[0] ?? 'registro';
    res.status(409).json({ erro: `Já existe um cadastro com esse ${chave}` });
    return;
  }

  console.error(err);
  res.status(500).json({ erro: 'Erro interno. Tente de novo em instantes.' });
}
