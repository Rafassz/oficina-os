import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { normalizarPlaca, placaValida } from './texto';

export const objectId = z.string().refine(isValidObjectId, 'ID inválido');

export const placa = z
  .string()
  .transform(normalizarPlaca)
  .refine(placaValida, 'Placa inválida (use ABC1234 ou ABC1D23)');

export const paginacao = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
});
