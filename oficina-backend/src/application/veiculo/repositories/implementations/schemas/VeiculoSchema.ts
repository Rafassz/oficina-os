import { Schema, model } from 'mongoose'

const veiculoSchema = new Schema(
  {
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    placa: { type: String, required: true, unique: true, uppercase: true, trim: true },
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    ano: { type: Number },
    cor: { type: String, trim: true },
    km: { type: Number, min: 0 },
  },
  { timestamps: true },
)

export const VeiculoModel = model('Veiculo', veiculoSchema)
