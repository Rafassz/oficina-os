import { DataBaseError, NotFoundError, Result } from '../../../../utils'
import { IUsuario, IUsuarioComSenha } from '../../models'
import {
  ICreateUsuarioParams,
  ICreateUsuarioResponse,
  IFindUsuarioByEmailParams,
  IFindUsuarioByEmailResponse,
  IFindUsuarioByIdParams,
  IFindUsuarioByIdResponse,
  IGetAllUsuariosParams,
  IGetAllUsuariosResponse,
  IUsuarioRepository,
} from '../interfaces'
import { UsuarioModel } from './schemas/UsuarioSchema'

const paraUsuario = (doc: any): IUsuario => ({
  _id: String(doc._id),
  nome: doc.nome,
  email: doc.email,
  papel: doc.papel,
  ativo: doc.ativo,
  createdAt: doc.createdAt,
})

export class MongoUsuarioRepository implements IUsuarioRepository {
  async findById(data: IFindUsuarioByIdParams): Promise<IFindUsuarioByIdResponse> {
    try {
      const doc = await UsuarioModel.findById(data.IdUsuario).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Usuário' }))
      return Result.ok(paraUsuario(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findByEmail(data: IFindUsuarioByEmailParams): Promise<IFindUsuarioByEmailResponse> {
    try {
      const doc = await UsuarioModel.findOne({ email: data.email }).select('+senhaHash').lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Usuário' }))
      const usuario: IUsuarioComSenha = { ...paraUsuario(doc), senhaHash: doc.senhaHash }
      return Result.ok(usuario)
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getAll(data: IGetAllUsuariosParams): Promise<IGetAllUsuariosResponse> {
    try {
      const filtro: Record<string, unknown> = {}
      if (data.somenteAtivos) filtro.ativo = true
      if (data.papel) filtro.papel = data.papel

      const docs = await UsuarioModel.find(filtro).sort({ nome: 1 }).lean()
      return Result.ok(docs.map(paraUsuario))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async create(data: ICreateUsuarioParams): Promise<ICreateUsuarioResponse> {
    try {
      const doc = await UsuarioModel.create(data)
      return Result.ok(paraUsuario(doc.toObject()))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }
}
