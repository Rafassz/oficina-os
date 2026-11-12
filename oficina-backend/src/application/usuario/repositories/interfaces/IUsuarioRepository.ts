import { IDataBaseError, INotFoundError, IPapel, IResultError, IUnknownError, Result } from '../../../../utils'
import { IUsuario, IUsuarioComSenha } from '../../models'

// Find By Id
export type IFindUsuarioByIdErrors = IUnknownError | INotFoundError | IDataBaseError
export interface IFindUsuarioByIdParams {
  IdUsuario: string
}
export type IFindUsuarioByIdResponse = Result<IUsuario, IResultError<IFindUsuarioByIdErrors>>

// ###################################################################################################
// Find By Email (inclui o hash da senha)
export type IFindUsuarioByEmailErrors = IUnknownError | INotFoundError | IDataBaseError
export interface IFindUsuarioByEmailParams {
  email: string
}
export type IFindUsuarioByEmailResponse = Result<IUsuarioComSenha, IResultError<IFindUsuarioByEmailErrors>>

// ###################################################################################################
// Get All
export type IGetAllUsuariosErrors = IUnknownError | IDataBaseError
export interface IGetAllUsuariosParams {
  papel: IPapel | null
  somenteAtivos: boolean
}
export type IGetAllUsuariosResponse = Result<IUsuario[], IResultError<IGetAllUsuariosErrors>>

// ###################################################################################################
// Create
export type ICreateUsuarioErrors = IUnknownError | IDataBaseError
export interface ICreateUsuarioParams {
  nome: string
  email: string
  senhaHash: string
  papel: IPapel
}
export type ICreateUsuarioResponse = Result<IUsuario, IResultError<ICreateUsuarioErrors>>

// ###################################################################################################
export interface IUsuarioRepository {
  findById(data: IFindUsuarioByIdParams): Promise<IFindUsuarioByIdResponse>

  findByEmail(data: IFindUsuarioByEmailParams): Promise<IFindUsuarioByEmailResponse>

  getAll(data: IGetAllUsuariosParams): Promise<IGetAllUsuariosResponse>

  create(data: ICreateUsuarioParams): Promise<ICreateUsuarioResponse>
}
