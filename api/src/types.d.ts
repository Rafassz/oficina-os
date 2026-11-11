import type { Papel } from './models/Usuario';

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: string; nome: string; papel: Papel };
    }
  }
}

export {};
