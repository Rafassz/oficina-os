import { Schema, model } from 'mongoose'

// Sequência numérica (o _id do Mongo não serve pra numerar OS no balcão)
const contadorSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

export const ContadorModel = model('Contador', contadorSchema)
