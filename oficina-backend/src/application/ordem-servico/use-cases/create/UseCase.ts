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
} from '../../../../utils'
import { IUsuarioRepository } from '../../../usuario/repositories'
import { IVeiculoRepository } from '../../../veiculo/repositories'
import { STATUS_FINALIZADOS } from '../../models'
import { IOrdemServicoRepository } from '../../repositories'
import { lerData, montarResposta, validarMecanico, validarRelato } from '../shared'
import { IRequest, IResponse } from './DTO'

type Errors =
  | IUnknownError
  | IDataBaseError
  | INotFoundError
  | IRequiredFieldError
  | IInvalidFieldError
  | INotAcceptableError

export interface ICreateOrdemUseCase {
  execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>>
}

const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export class CreateOrdemUseCase implements ICreateOrdemUseCase {
  private readonly _ordemServicoRepository: IOrdemServicoRepository
  private readonly _veiculoRepository: IVeiculoRepository
  private readonly _usuarioRepository: IUsuarioRepository

  constructor(props: {
    repository: {
      ordemServicoRepository: IOrdemServicoRepository
      veiculoRepository: IVeiculoRepository
      usuarioRepository: IUsuarioRepository
    }
  }) {
    this._ordemServicoRepository = props.repository.ordemServicoRepository
    this._veiculoRepository = props.repository.veiculoRepository
    this._usuarioRepository = props.repository.usuarioRepository
  }

  @LogThis('CreateOrdemUseCase')
  async execute(request: IRequest): Promise<Result<IResponse, IResultError<Errors>>> {
    const agora = new Date()

    // 1 - validar entrada
    if (!request.IdCliente) return Result.fail(RequiredFieldError({ key: 'cliente' }))
    if (!request.IdVeiculo) return Result.fail(RequiredFieldError({ key: 'veiculo' }))
    if (!idValido(request.IdCliente)) return Result.fail(InvalidFieldError({ key: 'cliente' }))
    if (!idValido(request.IdVeiculo)) return Result.fail(InvalidFieldError({ key: 'veiculo' }))

    const relato = validarRelato(request.relato)
    if ('erro' in relato) return Result.fail(relato.erro)

    const previsao = lerData(request.previsaoEntrega)
    if ('erro' in previsao) return Result.fail(previsao.erro)
    if (previsao.data && previsao.data < inicioDoDia(agora)) {
      return Result.fail(InvalidFieldError({ key: 'previsaoEntrega', message: 'Previsão de entrega no passado' }))
    }

    let kmEntrada: number | undefined
    if (request.kmEntrada !== undefined && request.kmEntrada !== '') {
      kmEntrada = Number(request.kmEntrada)
      if (!Number.isInteger(kmEntrada) || kmEntrada < 0) return Result.fail(InvalidFieldError({ key: 'kmEntrada' }))
    }

    // 2 - o veículo é do cliente informado?
    const veiculo = await this._veiculoRepository.findById({ IdVeiculo: request.IdVeiculo })
    if (veiculo.isFailure) return Result.fail(veiculo.error!)
    const { placa, km: kmAnterior, cliente } = veiculo.getValue()!
    if (cliente !== request.IdCliente) {
      return Result.fail(NotAcceptableError({ message: 'Esse veículo não pertence ao cliente selecionado' }))
    }

    // 3 - um carro não fica em duas OS abertas ao mesmo tempo
    const aberta = await this._ordemServicoRepository.findAbertaByVeiculo({
      IdVeiculo: request.IdVeiculo,
      statusFinalizados: STATUS_FINALIZADOS,
    })
    if (aberta.isFailure) return Result.fail(aberta.error!)
    if (aberta.getValue()) {
      return Result.fail(
        NotAcceptableError({
          message: `O veículo ${placa} já está na OS nº ${aberta.getValue()!.numero}, que ainda não foi fechada`,
          extraInfo: { IdOrdemServico: aberta.getValue()!._id },
        }),
      )
    }

    // 4 - hodômetro não volta
    if (kmEntrada !== undefined && kmEntrada < (kmAnterior ?? 0)) {
      return Result.fail(NotAcceptableError({ message: `KM informado é menor que o último registrado (${kmAnterior})` }))
    }

    // 5 - responsável (opcional)
    const mecanico = await validarMecanico(this._usuarioRepository, request.IdMecanico)
    if (mecanico.isFailure) return Result.fail(mecanico.error!)

    // 6 - gravar
    const numero = await this._ordemServicoRepository.proximoNumero()
    if (numero.isFailure) return Result.fail(numero.error!)

    const criada = await this._ordemServicoRepository.create({
      numero: numero.getValue()!,
      cliente: request.IdCliente,
      veiculo: request.IdVeiculo,
      mecanico: mecanico.getValue()!,
      kmEntrada,
      relato: relato.relato,
      previsaoEntrega: previsao.data ?? null,
      historico: [{ status: 'orcamento', em: agora, por: lerToken(request.token).IdUsuario, obs: 'Veículo recebido' }],
    })
    if (criada.isFailure) return Result.fail(criada.error!)

    if (kmEntrada !== undefined) {
      const km = await this._veiculoRepository.update({ IdVeiculo: request.IdVeiculo, dados: { km: kmEntrada } })
      if (km.isFailure) return Result.fail(km.error!)
    }

    const detalhada = await this._ordemServicoRepository.findDetalhadaById({ IdOrdemServico: criada.getValue()!._id })
    if (detalhada.isFailure) return Result.fail(detalhada.error!)

    return Result.ok(montarResposta(detalhada.getValue()!))
  }
}
