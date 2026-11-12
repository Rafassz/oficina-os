import { Schema, model } from 'mongoose'

const clienteSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    documento: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    observacoes: { type: String, trim: true },
  },
  { timestamps: true },
)

clienteSchema.index({ nome: 1 })
clienteSchema.index({ documento: 1 }, { unique: true, partialFilterExpression: { documento: { $type: 'string' } } })

export const ClienteModel = model('Cliente', clienteSchema)
