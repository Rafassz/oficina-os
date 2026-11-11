import { Schema, model } from 'mongoose';

const clienteSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    // CPF ou CNPJ, só dígitos. Opcional: muito cliente de balcão não informa.
    documento: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    observacoes: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } },
);

clienteSchema.index({ nome: 1 });
clienteSchema.index({ documento: 1 }, { unique: true, partialFilterExpression: { documento: { $type: 'string', $gt: '' } } });

export const Cliente = model('Cliente', clienteSchema);
