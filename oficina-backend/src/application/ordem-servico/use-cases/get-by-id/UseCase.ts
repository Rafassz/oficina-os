import {
  IDataBaseError,
  IInvalidFieldError,
  INotFoundError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  Result,
  idValido,
} from '../../../../utils'
import { IOrdemServicoRepository } from '../../repositories'
import { montarResposta } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | INotFoundError | IInvalidFieldError

export interface IGetOrdemByIdUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class GetOrdemByIdUseCase implements IGetOrdemByIdUseCase {
  private readonly _ordemServicoRepository: IOrdemServicoRepository

  constructor(props: { repository: { ordemServicoRepository: IOrdemServicoRepository } }) {
    this._ordemServicoRepository = props.repository.ordemServicoRepository
  }

  @LogThis('GetOrdemByIdUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdOrdemServico)) return Result.fail(InvalidFieldError({ key: 'IdOrdemServico' }))

    const ordem = await this._ordemServicoRepository.findDetalhadaById({ IdOrdemServico: request.IdOrdemServico })
    if (ordem.isFailure) return Result.fail(ordem.error!)

    // a tela recebe junto os totais e quais botões de status mostrar
    return Result.ok(montarResposta(ordem.getValue()!))
  }
}
