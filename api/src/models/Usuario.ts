import { Schema, model, InferSchemaType } from 'mongoose';

export const PAPEIS = ['admin', 'atendente', 'mecanico'] as const;
export type Papel = (typeof PAPEIS)[number];

const usuarioSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true, select: false },
    papel: { type: String, enum: PAPEIS, default: 'atendente' },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.senhaHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export type UsuarioDoc = InferSchemaType<typeof usuarioSchema>;
export const Usuario = model('Usuario', usuarioSchema);
