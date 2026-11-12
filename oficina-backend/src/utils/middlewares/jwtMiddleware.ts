import { NextFunction, Request, Response } from 'express'
import { lerToken, tokenDoHeader } from '../token'

// Só barra requisição sem token válido. Quem é o usuário e o que pode fazer fica no UseCase.
export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    lerToken(tokenDoHeader(req.headers.authorization))
    next()
  } catch {
    res.status(401).json({ type: 'WrongCredentials', message: 'Faça login para continuar' })
  }
}
