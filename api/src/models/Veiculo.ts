import { Schema, model } from 'mongoose';

const veiculoSchema = new Schema(
  {
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    placa: { type: String, required: true, unique: true, uppercase: true, trim: true },
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    ano: { type: Number },
    cor: { type: String, trim: true },
    // última quilometragem conhecida, atualizada a cada entrada na oficina
    km: { type: Number, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } },
);

export const Veiculo = model('Veiculo', veiculoSchema);
