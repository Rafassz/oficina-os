import {
  IDataBaseError,
  IInvalidFieldError,
  INotAcceptableError,
  INotFoundError,
  IRequiredFieldError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  NotAcceptableError,
  RequiredFieldError,
  Result,
  idValido,
  lerToken,
  textoOuVazio,
} from '../../../../utils'
import { IStatusOS, STATUS_OS } from '../../models'
import { IOrdemServicoRepository, IUpdateOrdemParams } from '../../repositories'
import { LIMITES_OS, montarResposta, podeMudarStatus } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | INotAcceptableError

export interface IMudarStatusOrdemUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class MudarStatusOrdemUseCase implements IMudarStatusOrdemUseCase {
  private readonly _ordemServicoRepository: IOrdemServicoRepository

  constructor(props: { repository: { ordemServicoRepository: IOrdemServicoRepository } }) {
    this._ordemServicoRepository = props.repository.ordemServicoRepository
  }

  @LogThis('MudarStatusOrdemUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdOrdemServico)) return Result.fail(InvalidFieldError({ key: 'IdOrdemServico' }))
    if (!request.status) return Result.fail(RequiredFieldError({ key: 'status' }))
    if (!STATUS_OS.includes(request.status as IStatusOS)) return Result.fail(InvalidFieldError({ key: 'status' }))
    const novo = request.status as IStatusOS

    const obs = textoOuVazio(request.obs)
    if (obs.length > LIMITES_OS.obsMax) return Result.fail(InvalidFieldError({ key: 'obs', message: 'Observação muito longa' }))

    const busca = await this._ordemServicoRepository.findById({ IdOrdemServico: request.IdOrdemServico })
    if (busca.isFailure) return Result.fail(busca.error!)
    const ordem = busca.getValue()!

    // 1 - só os passos previstos no fluxo da oficina
    if (!podeMudarStatus(ordem.status, novo)) {
      return Result.fail(
        NotAcceptableError({
          message: `Não é possível passar de "${ordem.status}" para "${novo}"`,
          extraInfo: { de: ordem.status, para: novo },
        }),
      )
    }

    // 2 - regras de cada passo
    if (novo === 'aprovada' && ordem.itens.length === 0) {
      return Result.fail(NotAcceptableError({ message: 'Inclua ao menos um item no orçamento antes de aprovar' }))
    }
    if (novo === 'cancelada' && !obs) {
      return Result.fail(RequiredFieldError({ key: 'motivo do cancelamento' }))
    }

    // 3 - registrar no histórico quem mudou e quando
    const agora = new Date()
    const dados: IUpdateOrdemParams['dados'] = { status: novo }
    if (novo === 'entregue') dados.entregueEm = agora

    const atualizada = await this._ordemServicoRepository.update({
      IdOrdemServico: request.IdOrdemServico,
      dados,
      novoEvento: { status: novo, em: agora, por: lerToken(request.token).IdUsuario, ...(obs ? { obs } : {}) },
    })
    if (atualizada.isFailure) return Result.fail(atualizada.error!)

    const detalhada = await this._ordemServicoRepository.findDetalhadaById({ IdOrdemServico: request.IdOrdemServico })
    if (detalhada.isFailure) return Result.fail(detalhada.error!)

    return Result.ok(montarResposta(detalhada.getValue()!))
  }
}
