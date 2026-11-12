import {
  IDataBaseError,
  IInvalidFieldError,
  INotAcceptableError,
  INotFoundError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  LogThis,
  NotAcceptableError,
  Result,
  idValido,
  textoOuVazio,
} from '../../../../utils'
import { IUsuarioRepository } from '../../../usuario/repositories'
import { STATUS_COM_ITENS_TRAVADOS, STATUS_FINALIZADOS } from '../../models'
import { IOrdemServicoRepository, IUpdateOrdemParams } from '../../repositories'
import { LIMITES_OS, lerData, montarResposta, subtotalItens, validarItens, validarMecanico, validarRelato } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors = IUnknownError | IDataBaseError | INotFoundError | IInvalidFieldError | INotAcceptableError

export interface IUpdateOrdemUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

export class UpdateOrdemUseCase implements IUpdateOrdemUseCase {
  private readonly _ordemServicoRepository: IOrdemServicoRepository
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: {
    repository: { ordemServicoRepository: IOrdemServicoRepository; usuarioRepository: IUsuarioRepository }
  }) {
    this._ordemServicoRepository = props.repository.ordemServicoRepository
    this._usuarioRepository = props.repository.usuarioRepository
  }

  @LogThis('UpdateOrdemUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    if (!idValido(request.IdOrdemServico)) return Result.fail(InvalidFieldError({ key: 'IdOrdemServico' }))

    const busca = await this._ordemServicoRepository.findById({ IdOrdemServico: request.IdOrdemServico })
    if (busca.isFailure) return Result.fail(busca.error!)
    const ordem = busca.getValue()!

    // 1 - OS fechada é documento: não muda mais
    if (STATUS_FINALIZADOS.includes(ordem.status)) {
      return Result.fail(NotAcceptableError({ message: 'OS finalizada não pode ser alterada' }))
    }

    const mexeNosValores = request.itens !== undefined || request.desconto !== undefined
    if (mexeNosValores && STATUS_COM_ITENS_TRAVADOS.includes(ordem.status)) {
      return Result.fail(
        NotAcceptableError({ message: 'Os itens não podem mudar depois que a OS foi marcada como pronta' }),
      )
    }

    const dados: IUpdateOrdemParams['dados'] = {}

    // 2 - textos
    if (request.relato !== undefined) {
      const relato = validarRelato(request.relato)
      if ('erro' in relato) return Result.fail(relato.erro)
      dados.relato = relato.relato
    }
    if (request.diagnostico !== undefined) {
      const diagnostico = textoOuVazio(request.diagnostico)
      if (diagnostico.length > LIMITES_OS.diagnosticoMax) {
        return Result.fail(InvalidFieldError({ key: 'diagnostico', message: 'Diagnóstico muito longo' }))
      }
      dados.diagnostico = diagnostico
    }

    // 3 - itens e desconto (o desconto não pode passar do valor da OS)
    if (request.itens !== undefined) {
      const itens = validarItens(request.itens)
      if ('erro' in itens) return Result.fail(itens.erro)
      dados.itens = itens.itens
    }
    if (request.desconto !== undefined) {
      const desconto = Number(request.desconto)
      if (!Number.isInteger(desconto) || desconto < 0) return Result.fail(InvalidFieldError({ key: 'desconto' }))
      dados.desconto = desconto
    }
    const descontoFinal = dados.desconto ?? ordem.desconto
    if (descontoFinal > subtotalItens(dados.itens ?? ordem.itens)) {
      return Result.fail(NotAcceptableError({ message: 'Desconto maior que o valor da OS' }))
    }

    // 4 - prazo e responsável
    const previsao = lerData(request.previsaoEntrega)
    if ('erro' in previsao) return Result.fail(previsao.erro)
    if (previsao.data !== undefined) dados.previsaoEntrega = previsao.data

    if (request.IdMecanico !== undefined) {
      const mecanico = await validarMecanico(this._usuarioRepository, request.IdMecanico)
      if (mecanico.isFailure) return Result.fail(mecanico.error!)
      dados.mecanico = mecanico.getValue()!
    }

    // 5 - gravar e devolver já com totais
    const atualizada = await this._ordemServicoRepository.update({ IdOrdemServico: request.IdOrdemServico, dados })
    if (atualizada.isFailure) return Result.fail(atualizada.error!)

    const detalhada = await this._ordemServicoRepository.findDetalhadaById({ IdOrdemServico: request.IdOrdemServico })
    if (detalhada.isFailure) return Result.fail(detalhada.error!)

    return Result.ok(montarResposta(detalhada.getValue()!))
  }
}
