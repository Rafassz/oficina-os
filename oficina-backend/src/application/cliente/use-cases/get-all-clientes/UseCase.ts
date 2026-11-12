import {
  IDataBaseError,
  IResultError,
  IUnknownError,
  LogThis,
  Result,
  lerPaginacao,
  somenteDigitos,
  textoOuVazio,
} from '../../../../utils'
import { IClienteRepository } from '../../repositories'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError

export interface IGetAllClientesUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class GetAllClientesUseCase implements IGetAllClientesUseCase {
  private readonly _clienteRepository: IClienteRepository

  constructor(props: { repository: { clienteRepository: IClienteRepository } }) {
    this._clienteRepository = props.repository.clienteRepository
  }

  @LogThis('GetAllClientesUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const busca = textoOuVazio(request.busca)
    const digitos = somenteDigitos(busca)

    // o atendente digita nome, telefone ou CPF no mesmo campo;
    // só procura por dígitos quando há pelo menos 3, senão "1" casa com todo mundo
    const clientes = await this._clienteRepository.getAll({
      nome: busca || null,
      digitos: digitos.length >= 3 ? digitos : null,
      ...lerPaginacao(request.pagina, request.porPagina),
    })
    if (clientes.isFailure) return Result.fail(clientes.error!)

    return Result.ok(clientes.getValue()!)
  }
}
