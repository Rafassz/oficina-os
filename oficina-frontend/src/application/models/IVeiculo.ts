export interface IVeiculo {
  _id: string
  cliente: string
  placa: string
  marca: string
  modelo: string
  ano?: number
  cor?: string
  km?: number
}

export interface IVeiculoParams {
  cliente: string
  placa: string
  marca: string
  modelo: string
  ano?: number
  cor?: string
  km?: number
}
