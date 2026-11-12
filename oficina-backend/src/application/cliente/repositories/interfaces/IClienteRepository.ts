import { IDataBaseError, INotFoundError, IResultError, IUnknownError, Result } from '../../../../utils'
import { ICliente, IClientePaginado } from '../../models'

type ErrosLeitura = IUnknownError | INotFoundError | IDataBaseError
type ErrosEscrita = IUnknownError | IDataBaseError

// Find By Id
export interface IFindClienteByIdParams {
  IdCliente: string
}
export type IFindClienteByIdResponse = Result<ICliente, IResultError<ErrosLeitura>>

// ###################################################################################################
// Find By Documento (CPF/CNPJ)
export interface IFindClienteByDocumentoParams {
  documento: string
}
export type IFindClienteByDocumentoResponse = Result<ICliente, IResultError<ErrosLeitura>>

// ###################################################################################################
// Get All (busca por nome, telefone ou documento)
export interface IGetAllClientesParams {
  nome: string | null
  digitos: string | null
  pagina: number
  porPagina: number
}
export type IGetAllClientesResponse = Result<IClientePaginado, IResultError<ErrosEscrita>>

// ###################################################################################################
// Ids por trecho do nome (usado na busca de OS)
export interface IFindClienteIdsByNomeParams {
  nome: string
}
export type IFindClienteIdsByNomeResponse = Result<string[], IResultError<ErrosEscrita>>

// ###################################################################################################
// Create
export interface ICreateClienteParams {
  nome: string
  telefone: string
  documento?: string
  email?: string
  observacoes?: string
}
export type ICreateClienteResponse = Result<ICliente, IResultError<ErrosEscrita>>

// ###################################################################################################
// Update — campos em "remover" são apagados do documento
export interface IUpdateClienteParams {
  IdCliente: string
  dados: Partial<Omit<ICreateClienteParams, 'documento' | 'email' | 'observacoes'>> & {
    documento?: string
    email?: string
    observacoes?: string
  }
  remover: ('documento' | 'email' | 'observacoes')[]
}
export type IUpdateClienteResponse = Result<ICliente, IResultError<ErrosLeitura>>

// ###################################################################################################
// Delete
export interface IDeleteClienteParams {
  IdCliente: string
}
export type IDeleteClienteResponse = Result<void, IResultError<ErrosLeitura>>

// ###################################################################################################
export interface IClienteRepository {
  findById(data: IFindClienteByIdParams): Promise<IFindClienteByIdResponse>

  findByDocumento(data: IFindClienteByDocumentoParams): Promise<IFindClienteByDocumentoResponse>

  getAll(data: IGetAllClientesParams): Promise<IGetAllClientesResponse>

  findIdsByNome(data: IFindClienteIdsByNomeParams): Promise<IFindClienteIdsByNomeResponse>

  create(data: ICreateClienteParams): Promise<ICreateClienteResponse>

  update(data: IUpdateClienteParams): Promise<IUpdateClienteResponse>

  delete(data: IDeleteClienteParams): Promise<IDeleteClienteResponse>
}
