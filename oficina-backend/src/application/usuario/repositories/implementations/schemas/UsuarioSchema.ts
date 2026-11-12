import { Schema, model } from 'mongoose'

const usuarioSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true, select: false },
    papel: { type: String, enum: ['admin', 'atendente', 'mecanico'], default: 'atendente' },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const UsuarioModel = model('Usuario', usuarioSchema)
