import { Schema, model } from 'mongoose'
import { STATUS_OS } from '../../../models'

const itemSchema = new Schema(
  {
    tipo: { type: String, enum: ['peca', 'servico'], required: true },
    descricao: { type: String, required: true, trim: true },
    quantidade: { type: Number, required: true, min: 0 },
    valorUnitario: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const historicoSchema = new Schema(
  {
    status: { type: String, enum: STATUS_OS, required: true },
    em: { type: Date, default: Date.now },
    por: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null },
    obs: { type: String, trim: true },
  },
  { _id: false },
)

const ordemServicoSchema = new Schema(
  {
    numero: { type: Number, required: true, unique: true },
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    veiculo: { type: Schema.Types.ObjectId, ref: 'Veiculo', required: true, index: true },
    mecanico: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null },
    status: { type: String, enum: STATUS_OS, default: 'orcamento', index: true },
    kmEntrada: { type: Number, min: 0 },
    relato: { type: String, required: true, trim: true },
    diagnostico: { type: String, trim: true, default: '' },
    itens: { type: [itemSchema], default: [] },
    desconto: { type: Number, default: 0, min: 0 },
    previsaoEntrega: { type: Date, default: null },
    entregueEm: { type: Date, default: null },
    historico: { type: [historicoSchema], default: [] },
  },
  { timestamps: true },
)

ordemServicoSchema.index({ status: 1, previsaoEntrega: 1 })
ordemServicoSchema.index({ entregueEm: 1 })

export const OrdemServicoModel = model('OrdemServico', ordemServicoSchema)
