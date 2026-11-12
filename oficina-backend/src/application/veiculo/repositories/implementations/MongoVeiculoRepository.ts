import { DataBaseError, NotFoundError, Result, escaparRegex } from '../../../../utils'
import { IVeiculo, IVeiculoComCliente } from '../../models'
import {
  ICreateVeiculoParams,
  ICreateVeiculoResponse,
  IDeleteVeiculosByClienteParams,
  IDeleteVeiculosByClienteResponse,
  IFindVeiculoByIdParams,
  IFindVeiculoByIdResponse,
  IFindVeiculoByPlacaParams,
  IFindVeiculoByPlacaResponse,
  IFindVeiculoIdsByTrechoPlacaParams,
  IFindVeiculoIdsByTrechoPlacaResponse,
  IGetVeiculosByClienteParams,
  IGetVeiculosByClienteResponse,
  ISearchVeiculosByPlacaParams,
  ISearchVeiculosByPlacaResponse,
  IUpdateVeiculoParams,
  IUpdateVeiculoResponse,
  IVeiculoRepository,
} from '../interfaces'
import { VeiculoModel } from './schemas/VeiculoSchema'

const paraVeiculo = (doc: any): IVeiculo => ({
  _id: String(doc._id),
  cliente: String(doc.cliente),
  placa: doc.placa,
  marca: doc.marca,
  modelo: doc.modelo,
  ano: doc.ano,
  cor: doc.cor,
  km: doc.km,
})

export class MongoVeiculoRepository implements IVeiculoRepository {
  async findById(data: IFindVeiculoByIdParams): Promise<IFindVeiculoByIdResponse> {
    try {
      const doc = await VeiculoModel.findById(data.IdVeiculo).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Veículo' }))
      return Result.ok(paraVeiculo(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findByPlaca(data: IFindVeiculoByPlacaParams): Promise<IFindVeiculoByPlacaResponse> {
    try {
      const doc = await VeiculoModel.findOne({ placa: data.placa }).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Veículo' }))
      return Result.ok(paraVeiculo(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async searchByPlaca(data: ISearchVeiculosByPlacaParams): Promise<ISearchVeiculosByPlacaResponse> {
    try {
      const docs = await VeiculoModel.find({ placa: { $regex: `^${escaparRegex(data.prefixo)}` } })
        .populate<{ cliente: any }>('cliente', 'nome telefone')
        .limit(data.limite)
        .lean()

      const veiculos: IVeiculoComCliente[] = docs.map((doc) => ({
        ...paraVeiculo(doc),
        cliente: { _id: String(doc.cliente._id), nome: doc.cliente.nome, telefone: doc.cliente.telefone },
      }))
      return Result.ok(veiculos)
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findIdsByTrechoPlaca(data: IFindVeiculoIdsByTrechoPlacaParams): Promise<IFindVeiculoIdsByTrechoPlacaResponse> {
    try {
      const docs = await VeiculoModel.find({ placa: { $regex: escaparRegex(data.trecho) } }).select('_id').lean()
      return Result.ok(docs.map((d) => String(d._id)))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getByCliente(data: IGetVeiculosByClienteParams): Promise<IGetVeiculosByClienteResponse> {
    try {
      const docs = await VeiculoModel.find({ cliente: data.IdCliente }).sort({ createdAt: -1 }).lean()
      return Result.ok(docs.map(paraVeiculo))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async create(data: ICreateVeiculoParams): Promise<ICreateVeiculoResponse> {
    try {
      const doc = await VeiculoModel.create(data)
      return Result.ok(paraVeiculo(doc.toObject()))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async update(data: IUpdateVeiculoParams): Promise<IUpdateVeiculoResponse> {
    try {
      const doc = await VeiculoModel.findByIdAndUpdate(data.IdVeiculo, { $set: data.dados }, { new: true }).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Veículo' }))
      return Result.ok(paraVeiculo(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async deleteByCliente(data: IDeleteVeiculosByClienteParams): Promise<IDeleteVeiculosByClienteResponse> {
    try {
      await VeiculoModel.deleteMany({ cliente: data.IdCliente })
      return Result.ok()
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }
}
