import { Schema, model } from 'mongoose';
import { STATUS_OS } from '../domain/status-os';

// Valores sempre em centavos (inteiro) pra não ter problema de arredondamento com float.
const itemSchema = new Schema(
  {
    tipo: { type: String, enum: ['peca', 'servico'], required: true },
    descricao: { type: String, required: true, trim: true },
    quantidade: { type: Number, required: true, min: 0 },
    valorUnitario: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const historicoSchema = new Schema(
  {
    status: { type: String, enum: STATUS_OS, required: true },
    em: { type: Date, default: Date.now },
    por: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    obs: { type: String, trim: true },
  },
  { _id: false },
);

const ordemSchema = new Schema(
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
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } },
);

// Os totais dependem de "itens"; em consultas que não selecionam o campo, ficam de fora.
ordemSchema.virtual('totalPecas').get(function () {
  if (!this.itens) return undefined;
  return somar(this.itens.filter((i) => i.tipo === 'peca'));
});

ordemSchema.virtual('totalServicos').get(function () {
  if (!this.itens) return undefined;
  return somar(this.itens.filter((i) => i.tipo === 'servico'));
});

ordemSchema.virtual('total').get(function () {
  if (!this.itens) return undefined;
  return Math.max(0, somar(this.itens) - (this.desconto ?? 0));
});

function somar(itens: { quantidade: number; valorUnitario: number }[]) {
  return itens.reduce((acc, i) => acc + Math.round(i.quantidade * i.valorUnitario), 0);
}

export function subtotalItens(itens: { quantidade: number; valorUnitario: number }[]) {
  return somar(itens);
}

ordemSchema.index({ status: 1, previsaoEntrega: 1 });
ordemSchema.index({ entregueEm: 1 });

export const OrdemServico = model('OrdemServico', ordemSchema);
