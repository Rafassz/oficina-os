import { Schema, model } from 'mongoose';

// Sequência numérica simples (o _id do Mongo não serve pra numerar OS no balcão).
const contadorSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Contador = model('Contador', contadorSchema);

export async function proximoNumero(chave: string) {
  const doc = await Contador.findOneAndUpdate(
    { _id: chave },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
}

export async function ajustarContador(chave: string, valor: number) {
  await Contador.updateOne({ _id: chave }, { $max: { seq: valor } }, { upsert: true });
}
