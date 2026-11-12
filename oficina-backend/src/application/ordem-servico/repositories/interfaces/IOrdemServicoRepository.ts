import { IDataBaseError, INotFoundError, IResultError, IUnknownError, Result } from '../../../../utils'
import { IEventoHistorico, IItemOS, IOrdemServico, IOrdemServicoDetalhada, IStatusOS } from '../../models'

type ErrosLeitura = IUnknownError | INotFoundError | IDataBaseError
type ErrosEscrita = IUnknownError | IDataBaseError

// Próximo número sequencial da OS
export type IProximoNumeroResponse = Result<number, IResultError<ErrosEscrita>>

// ###################################################################################################
// Find By Id (como gravado)
export interface IFindOrdemByIdParams {
  IdOrdemServico: string
}
export type IFindOrdemByIdResponse = Result<IOrdemServico, IResultError<ErrosLeitura>>
export type IFindOrdemDetalhadaByIdResponse = Result<IOrdemServicoDetalhada, IResultError<ErrosLeitura>>

// ###################################################################################################
// OS ainda não finalizada de um veículo
export interface IFindOrdemAbertaByVeiculoParams {
  IdVeiculo: string
  statusFinalizados: IStatusOS[]
}
export type IFindOrdemAbertaByVeiculoResponse = Result<IOrdemServico | null, IResultError<ErrosEscrita>>

// ###################################################################################################
// Existe alguma OS do cliente?
export interface IExistsOrdemByClienteParams {
  IdCliente: string
}
export type IExistsOrdemByClienteResponse = Result<boolean, IResultError<ErrosEscrita>>

// ###################################################################################################
// Get All (filtros já resolvidos pelo UseCase)
export interface IGetAllOrdensParams {
  statusIn: IStatusOS[] | null
  statusNotIn: IStatusOS[] | null
  previsaoAntesDe: Date | null
  // busca: qualquer um destes que bater
  numero: number | null
  IdsVeiculo: string[] | null
  IdsCliente: string[] | null
  pagina: number
  porPagina: number
}
export type IGetAllOrdensResponse = Result<
  { itens: IOrdemServicoDetalhada[]; total: number },
  IResultError<ErrosEscrita>
>

// ###################################################################################################
// Get By Cliente
export interface IGetOrdensByClienteParams {
  IdCliente: string
  limite: number
}
export type IGetOrdensByClienteResponse = Result<IOrdemServicoDetalhada[], IResultError<ErrosEscrita>>

// ###################################################################################################
// Create
export interface ICreateOrdemParams {
  numero: number
  cliente: string
  veiculo: string
  mecanico: string | null
  kmEntrada?: number
  relato: string
  previsaoEntrega: Date | null
  historico: IEventoHistorico[]
}
export type ICreateOrdemResponse = Result<IOrdemServico, IResultError<ErrosEscrita>>

// ###################################################################################################
// Update
export interface IUpdateOrdemParams {
  IdOrdemServico: string
  dados: Partial<{
    relato: string
    diagnostico: string
    itens: IItemOS[]
    desconto: number
    previsaoEntrega: Date | null
    mecanico: string | null
    status: IStatusOS
    entregueEm: Date | null
  }>
  novoEvento?: IEventoHistorico
}
export type IUpdateOrdemResponse = Result<IOrdemServico, IResultError<ErrosLeitura>>

// ###################################################################################################
// Painel
export interface IContarPorStatusParams {
  statusNotIn: IStatusOS[]
}
export type IContarPorStatusResponse = Result<Partial<Record<IStatusOS, number>>, IResultError<ErrosEscrita>>

export interface IContarAtrasadasParams {
  statusNotIn: IStatusOS[]
  agora: Date
}
export type IContarAtrasadasResponse = Result<number, IResultError<ErrosEscrita>>

export interface IGetEntreguesDesdeParams {
  desde: Date
}
export type IGetEntreguesDesdeResponse = Result<Pick<IOrdemServico, 'itens' | 'desconto'>[], IResultError<ErrosEscrita>>

export interface IGetProximasEntregasParams {
  statusNotIn: IStatusOS[]
  limite: number
}
export type IGetProximasEntregasResponse = Result<IOrdemServicoDetalhada[], IResultError<ErrosEscrita>>

// ###################################################################################################
export interface IOrdemServicoRepository {
  proximoNumero(): Promise<IProximoNumeroResponse>

  findById(data: IFindOrdemByIdParams): Promise<IFindOrdemByIdResponse>

  findDetalhadaById(data: IFindOrdemByIdParams): Promise<IFindOrdemDetalhadaByIdResponse>

  findAbertaByVeiculo(data: IFindOrdemAbertaByVeiculoParams): Promise<IFindOrdemAbertaByVeiculoResponse>

  existsByCliente(data: IExistsOrdemByClienteParams): Promise<IExistsOrdemByClienteResponse>

  getAll(data: IGetAllOrdensParams): Promise<IGetAllOrdensResponse>

  getByCliente(data: IGetOrdensByClienteParams): Promise<IGetOrdensByClienteResponse>

  create(data: ICreateOrdemParams): Promise<ICreateOrdemResponse>

  update(data: IUpdateOrdemParams): Promise<IUpdateOrdemResponse>

  contarPorStatus(data: IContarPorStatusParams): Promise<IContarPorStatusResponse>

  contarAtrasadas(data: IContarAtrasadasParams): Promise<IContarAtrasadasResponse>

  getEntreguesDesde(data: IGetEntreguesDesdeParams): Promise<IGetEntreguesDesdeResponse>

  getProximasEntregas(data: IGetProximasEntregasParams): Promise<IGetProximasEntregasResponse>
}
