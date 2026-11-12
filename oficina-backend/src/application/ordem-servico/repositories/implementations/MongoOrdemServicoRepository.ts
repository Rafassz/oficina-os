import { DataBaseError, NotFoundError, Result } from '../../../../utils'
import { IOrdemServico, IOrdemServicoDetalhada, IStatusOS } from '../../models'
import {
  IContarAtrasadasParams,
  IContarAtrasadasResponse,
  IContarPorStatusParams,
  IContarPorStatusResponse,
  ICreateOrdemParams,
  ICreateOrdemResponse,
  IExistsOrdemByClienteParams,
  IExistsOrdemByClienteResponse,
  IFindOrdemAbertaByVeiculoParams,
  IFindOrdemAbertaByVeiculoResponse,
  IFindOrdemByIdParams,
  IFindOrdemByIdResponse,
  IFindOrdemDetalhadaByIdResponse,
  IGetAllOrdensParams,
  IGetAllOrdensResponse,
  IGetEntreguesDesdeParams,
  IGetEntreguesDesdeResponse,
  IGetOrdensByClienteParams,
  IGetOrdensByClienteResponse,
  IGetProximasEntregasParams,
  IGetProximasEntregasResponse,
  IOrdemServicoRepository,
  IProximoNumeroResponse,
  IUpdateOrdemParams,
  IUpdateOrdemResponse,
} from '../interfaces'
import { ContadorModel } from './schemas/ContadorSchema'
import { OrdemServicoModel } from './schemas/OrdemServicoSchema'

const POPULAR = [
  { path: 'cliente', select: 'nome telefone' },
  { path: 'veiculo', select: 'placa marca modelo ano cor' },
  { path: 'mecanico', select: 'nome' },
  { path: 'historico.por', select: 'nome' },
]

const idOuNull = (v: any) => (v ? String(v._id ?? v) : null)
const refNome = (v: any) => (v && v.nome !== undefined ? { _id: String(v._id), nome: v.nome } : null)

const paraOrdem = (doc: any): IOrdemServico => ({
  _id: String(doc._id),
  numero: doc.numero,
  cliente: String(doc.cliente),
  veiculo: String(doc.veiculo),
  mecanico: idOuNull(doc.mecanico),
  status: doc.status,
  kmEntrada: doc.kmEntrada,
  relato: doc.relato,
  diagnostico: doc.diagnostico ?? '',
  itens: (doc.itens ?? []).map((i: any) => ({
    tipo: i.tipo,
    descricao: i.descricao,
    quantidade: i.quantidade,
    valorUnitario: i.valorUnitario,
  })),
  desconto: doc.desconto ?? 0,
  previsaoEntrega: doc.previsaoEntrega ?? null,
  entregueEm: doc.entregueEm ?? null,
  historico: (doc.historico ?? []).map((h: any) => ({ status: h.status, em: h.em, por: idOuNull(h.por), obs: h.obs })),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})

const paraDetalhada = (doc: any): IOrdemServicoDetalhada => ({
  ...paraOrdem({ ...doc, cliente: doc.cliente?._id, veiculo: doc.veiculo?._id, historico: [] }),
  cliente: { _id: String(doc.cliente._id), nome: doc.cliente.nome, telefone: doc.cliente.telefone },
  veiculo: {
    _id: String(doc.veiculo._id),
    placa: doc.veiculo.placa,
    marca: doc.veiculo.marca,
    modelo: doc.veiculo.modelo,
    ano: doc.veiculo.ano,
    cor: doc.veiculo.cor,
  },
  mecanico: refNome(doc.mecanico),
  historico: (doc.historico ?? []).map((h: any) => ({ status: h.status, em: h.em, obs: h.obs, por: refNome(h.por) })),
})

export class MongoOrdemServicoRepository implements IOrdemServicoRepository {
  async proximoNumero(): Promise<IProximoNumeroResponse> {
    try {
      const doc = await ContadorModel.findOneAndUpdate({ _id: 'os' }, { $inc: { seq: 1 } }, { new: true, upsert: true })
      return Result.ok(doc.seq)
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findById(data: IFindOrdemByIdParams): Promise<IFindOrdemByIdResponse> {
    try {
      const doc = await OrdemServicoModel.findById(data.IdOrdemServico).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Ordem de serviço' }))
      return Result.ok(paraOrdem(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findDetalhadaById(data: IFindOrdemByIdParams): Promise<IFindOrdemDetalhadaByIdResponse> {
    try {
      const doc = await OrdemServicoModel.findById(data.IdOrdemServico).populate(POPULAR).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Ordem de serviço' }))
      return Result.ok(paraDetalhada(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async findAbertaByVeiculo(data: IFindOrdemAbertaByVeiculoParams): Promise<IFindOrdemAbertaByVeiculoResponse> {
    try {
      const doc = await OrdemServicoModel.findOne({
        veiculo: data.IdVeiculo,
        status: { $nin: data.statusFinalizados },
      }).lean()
      return Result.ok(doc ? paraOrdem(doc) : null)
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async existsByCliente(data: IExistsOrdemByClienteParams): Promise<IExistsOrdemByClienteResponse> {
    try {
      return Result.ok(Boolean(await OrdemServicoModel.exists({ cliente: data.IdCliente })))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getAll(data: IGetAllOrdensParams): Promise<IGetAllOrdensResponse> {
    try {
      const filtro: Record<string, unknown> = {}
      const status: Record<string, IStatusOS[]> = {}
      if (data.statusIn) status.$in = data.statusIn
      if (data.statusNotIn) status.$nin = data.statusNotIn
      if (Object.keys(status).length) filtro.status = status
      if (data.previsaoAntesDe) filtro.previsaoEntrega = { $lt: data.previsaoAntesDe }

      const ou: Record<string, unknown>[] = []
      if (data.numero !== null) ou.push({ numero: data.numero })
      if (data.IdsVeiculo) ou.push({ veiculo: { $in: data.IdsVeiculo } })
      if (data.IdsCliente) ou.push({ cliente: { $in: data.IdsCliente } })
      if (ou.length) filtro.$or = ou

      const [docs, total] = await Promise.all([
        OrdemServicoModel.find(filtro)
          .select('-historico')
          .populate(POPULAR.slice(0, 3))
          .sort({ numero: -1 })
          .skip((data.pagina - 1) * data.porPagina)
          .limit(data.porPagina)
          .lean(),
        OrdemServicoModel.countDocuments(filtro),
      ])

      return Result.ok({ itens: docs.map(paraDetalhada), total })
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getByCliente(data: IGetOrdensByClienteParams): Promise<IGetOrdensByClienteResponse> {
    try {
      const docs = await OrdemServicoModel.find({ cliente: data.IdCliente })
        .select('-historico')
        .populate(POPULAR.slice(0, 3))
        .sort({ numero: -1 })
        .limit(data.limite)
        .lean()
      return Result.ok(docs.map(paraDetalhada))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async create(data: ICreateOrdemParams): Promise<ICreateOrdemResponse> {
    try {
      const doc = await OrdemServicoModel.create({ ...data, status: data.historico[0]?.status ?? 'orcamento' })
      return Result.ok(paraOrdem(doc.toObject()))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async update(data: IUpdateOrdemParams): Promise<IUpdateOrdemResponse> {
    try {
      const doc = await OrdemServicoModel.findByIdAndUpdate(
        data.IdOrdemServico,
        { $set: data.dados, ...(data.novoEvento ? { $push: { historico: data.novoEvento } } : {}) },
        { new: true },
      ).lean()
      if (!doc) return Result.fail(NotFoundError({ key: 'Ordem de serviço' }))
      return Result.ok(paraOrdem(doc))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async contarPorStatus(data: IContarPorStatusParams): Promise<IContarPorStatusResponse> {
    try {
      const grupos = await OrdemServicoModel.aggregate<{ _id: IStatusOS; qtd: number }>([
        { $match: { status: { $nin: data.statusNotIn } } },
        { $group: { _id: '$status', qtd: { $sum: 1 } } },
      ])
      return Result.ok(Object.fromEntries(grupos.map((g) => [g._id, g.qtd])))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async contarAtrasadas(data: IContarAtrasadasParams): Promise<IContarAtrasadasResponse> {
    try {
      const qtd = await OrdemServicoModel.countDocuments({
        status: { $nin: data.statusNotIn },
        previsaoEntrega: { $lt: data.agora },
      })
      return Result.ok(qtd)
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getEntreguesDesde(data: IGetEntreguesDesdeParams): Promise<IGetEntreguesDesdeResponse> {
    try {
      const docs = await OrdemServicoModel.find({ status: 'entregue', entregueEm: { $gte: data.desde } })
        .select('itens desconto')
        .lean()
      return Result.ok(docs.map((d) => ({ itens: paraOrdem(d).itens, desconto: d.desconto ?? 0 })))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }

  async getProximasEntregas(data: IGetProximasEntregasParams): Promise<IGetProximasEntregasResponse> {
    try {
      const docs = await OrdemServicoModel.find({ status: { $nin: data.statusNotIn }, previsaoEntrega: { $ne: null } })
        .select('-historico -itens')
        .populate(POPULAR.slice(0, 3))
        .sort({ previsaoEntrega: 1 })
        .limit(data.limite)
        .lean()
      return Result.ok(docs.map(paraDetalhada))
    } catch (error) {
      return Result.fail(DataBaseError({ error }))
    }
  }
}
