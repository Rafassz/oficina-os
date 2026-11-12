import { IOrdemServico } from './IOrdemServico'
import { IVeiculo } from './IVeiculo'

export interface ICliente {
  _id: string
  nome: string
  telefone: string
  documento?: string
  email?: string
  observacoes?: string
  createdAt: string
}

export interface IClienteParams {
  _id?: string
  nome: string
  telefone: string
  documento: string
  email: string
  observacoes: string
}

export interface IClienteDetalhe {
  cliente: ICliente
  veiculos: IVeiculo[]
  ordens: IOrdemServico[]
  totalGasto: number
}
