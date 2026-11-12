import { DataBaseError, NotFoundError, Result, escaparRegex } from '../../../../utils'
import { ICliente } from '../../models'
import {
  IClienteRepository,
  ICreateClienteParams,
  ICreateClienteResponse,
  IDeleteClienteParams,
  IDeleteClienteResponse,
  IFindClienteByDocumentoParams,
  IFindClienteByDocumentoResponse,
  IFindClienteByIdParams,
  IFindClienteByIdResponse,
  IFindClienteIdsByNomeParams,
  IFindClienteIdsByNomeResponse,
  IGetAllClientesParams,
  IGetAllClientesResponse,
  IUpdateClienteParams,
  IUpdateClienteResponse,
} from '../interfaces'
import { ClienteModel } from './schemas/ClienteSchema'

const paraCliente = (doc: any): ICliente => ({
  _id: String(doc._id),
  nome: doc.nome,
  telefone: doc.telefone,
  documento: doc.documento,
  email: doc.email,
  observacoes: doc.observacoes,
  createdAt: doc.createdAt,
})

export class MongoClienteRepository implements IClienteRepository {
  async findById(data: IFindClienteByIdParams): Promise<IFindClienteByIdResponse> {
    try {
      const doc = await ClienteModel.findById(data.IdCliente).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Cliente' }))
      return Result.ok(paraCliente(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findByDocumento(data: IFindClienteByDocumentoParams): Promise<IFindClienteByDocumentoResponse> {
    try {
      const doc = await ClienteModel.findOne({ documento: data.documento }).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Cliente' }))
      return Result.ok(paraCliente(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getAll(data: IGetAllClientesParams): Promise<IGetAllClientesResponse> {
    try {
      const ou: Record<string, unknown>[] = []
      if (data.nome) ou.push({ nome: { $regex: escaparRegex(data.nome), $options: 'i' } })
      if (data.digitos) ou.push({ telefone: { $regex: data.digitos } }, { documento: { $regex: data.digitos } })
      const filtro = ou.length ? { $or: ou } : {}

      const [docs, total] = await Promise.all([
        ClienteModel.find(filtro)
          .sort({ nome: 1 })
          .skip((data.pagina - 1) * data.porPagina)
          .limit(data.porPagina)
          .lean(),
        ClienteModel.countDocuments(filtro),
      ])

      return Result.ok({ itens: docs.map(paraCliente), total, pagina: data.pagina, porPagina: data.porPagina })
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findIdsByNome(data: IFindClienteIdsByNomeParams): Promise<IFindClienteIdsByNomeResponse> {
    try {
      const docs = await ClienteModel.find({ nome: { $regex: escaparRegex(data.nome), $options: 'i' } })
        .select('_id')
        .lean()
      return Result.ok(docs.map((d) => String(d._id)))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async create(data: ICreateClienteParams): Promise<ICreateClienteResponse> {
    try {
      const doc = await ClienteModel.create(data)
      return Result.ok(paraCliente(doc.toObject()))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async update(data: IUpdateClienteParams): Promise<IUpdateClienteResponse> {
    try {
      const unset = Object.fromEntries(data.remover.map((campo) => [campo, 1]))
      const doc = await ClienteModel.findByIdAndUpdate(
        data.IdCliente,
        { $set: data.dados, ...(data.remover.length ? { $unset: unset } : {}) },
        { new: true },
      ).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Cliente' }))
      return Result.ok(paraCliente(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async delete(data: IDeleteClienteParams): Promise<IDeleteClienteResponse> {
    try {
      const doc = await ClienteModel.findByIdAndDelete(data.IdCliente).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Cliente' }))
      return Result.ok()
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }
}
