import { IDataBaseError, INotFoundError, IResultError, IUnknownError, Result } from '../../../../utils'
import { IVeiculo, IVeiculoComCliente } from '../../models'

type ErrosLeitura = IUnknownError | INotFoundError | IDataBaseError
type ErrosEscrita = IUnknownError | IDataBaseError

// Find By Id
export interface IFindVeiculoByIdParams {
  IdVeiculo: string
}
export type IFindVeiculoByIdResponse = Result<IVeiculo, IResultError<ErrosLeitura>>

// ###################################################################################################
// Find By Placa (placa exata)
export interface IFindVeiculoByPlacaParams {
  placa: string
}
export type IFindVeiculoByPlacaResponse = Result<IVeiculo, IResultError<ErrosLeitura>>

// ###################################################################################################
// Busca por início da placa, com o dono
export interface ISearchVeiculosByPlacaParams {
  prefixo: string
  limite: number
}
export type ISearchVeiculosByPlacaResponse = Result<IVeiculoComCliente[], IResultError<ErrosEscrita>>

// ###################################################################################################
// Ids por trecho da placa (usado na busca de OS)
export interface IFindVeiculoIdsByTrechoPlacaParams {
  trecho: string
}
export type IFindVeiculoIdsByTrechoPlacaResponse = Result<string[], IResultError<ErrosEscrita>>

// ###################################################################################################
// Get By Cliente
export interface IGetVeiculosByClienteParams {
  IdCliente: string
}
export type IGetVeiculosByClienteResponse = Result<IVeiculo[], IResultError<ErrosEscrita>>

// ###################################################################################################
// Create
export interface ICreateVeiculoParams {
  cliente: string
  placa: string
  marca: string
  modelo: string
  ano?: number
  cor?: string
  km?: number
}
export type ICreateVeiculoResponse = Result<IVeiculo, IResultError<ErrosEscrita>>

// ###################################################################################################
// Update
export interface IUpdateVeiculoParams {
  IdVeiculo: string
  dados: Partial<Omit<ICreateVeiculoParams, 'cliente'>>
}
export type IUpdateVeiculoResponse = Result<IVeiculo, IResultError<ErrosLeitura>>

// ###################################################################################################
// Delete By Cliente
export interface IDeleteVeiculosByClienteParams {
  IdCliente: string
}
export type IDeleteVeiculosByClienteResponse = Result<void, IResultError<ErrosEscrita>>

// ###################################################################################################
export interface IVeiculoRepository {
  findById(data: IFindVeiculoByIdParams): Promise<IFindVeiculoByIdResponse>

  findByPlaca(data: IFindVeiculoByPlacaParams): Promise<IFindVeiculoByPlacaResponse>

  searchByPlaca(data: ISearchVeiculosByPlacaParams): Promise<ISearchVeiculosByPlacaResponse>

  findIdsByTrechoPlaca(data: IFindVeiculoIdsByTrechoPlacaParams): Promise<IFindVeiculoIdsByTrechoPlacaResponse>

  getByCliente(data: IGetVeiculosByClienteParams): Promise<IGetVeiculosByClienteResponse>

  create(data: ICreateVeiculoParams): Promise<ICreateVeiculoResponse>

  update(data: IUpdateVeiculoParams): Promise<IUpdateVeiculoResponse>

  deleteByCliente(data: IDeleteVeiculosByClienteParams): Promise<IDeleteVeiculosByClienteResponse>
}
