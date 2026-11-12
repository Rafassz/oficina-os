export interface IVeiculo {
  _id: string
  cliente: string
  placa: string
  marca: string
  modelo: string
  ano?: number
  cor?: string
  // última quilometragem conhecida, atualizada a cada entrada na oficina
  km?: number
}

export interface IVeiculoComCliente extends Omit<IVeiculo, 'cliente'> {
  cliente: { _id: string; nome: string; telefone: string }
}
