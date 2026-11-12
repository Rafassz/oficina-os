import { Result, gerarToken } from '../../../../../utils'
import { IUsuarioRepository } from '../../../../usuario/repositories'
import { IVeiculoRepository } from '../../../../veiculo/repositories'
import { IOrdemServicoRepository } from '../../../repositories'
import { CreateOrdemUseCase } from '../UseCase'

const mockOrdemRepository = {
  findAbertaByVeiculo: jest.fn(),
  proximoNumero: jest.fn(),
  create: jest.fn(),
  findDetalhadaById: jest.fn(),
} as unknown as jest.Mocked<IOrdemServicoRepository>
const mockVeiculoRepository = { findById: jest.fn(), update: jest.fn() } as unknown as jest.Mocked<IVeiculoRepository>
const mockUsuarioRepository = { findById: jest.fn() } as unknown as jest.Mocked<IUsuarioRepository>

const CLIENTE = '6500000000000000000000c1'
const VEICULO = '6500000000000000000000d1'
const ATENDENTE = '6500000000000000000000a1'
const MECANICO = '6500000000000000000000a2'

const token = gerarToken({ IdUsuario: ATENDENTE, Nome: 'Marcos', Papel: 'admin' })
const valido = { IdCliente: CLIENTE, IdVeiculo: VEICULO, relato: 'barulho no freio', kmEntrada: '30500', token }

describe('CreateOrdemUseCase', () => {
  const useCase = new CreateOrdemUseCase({
    repository: {
      ordemServicoRepository: mockOrdemRepository,
      veiculoRepository: mockVeiculoRepository,
      usuarioRepository: mockUsuarioRepository,
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockVeiculoRepository.findById.mockResolvedValue(
      Result.ok({ _id: VEICULO, cliente: CLIENTE, placa: 'ABC1D23', marca: 'Fiat', modelo: 'Mobi', km: 30000 }),
    )
    mockVeiculoRepository.update.mockResolvedValue(Result.ok({} as any))
    mockOrdemRepository.findAbertaByVeiculo.mockResolvedValue(Result.ok(null))
    mockOrdemRepository.proximoNumero.mockResolvedValue(Result.ok(1047))
    mockOrdemRepository.create.mockResolvedValue(Result.ok({ _id: 'os1' } as any))
    mockOrdemRepository.findDetalhadaById.mockResolvedValue(
      Result.ok({ _id: 'os1', status: 'orcamento', itens: [], desconto: 0 } as any),
    )
  })

  it('deve abrir a OS em orçamento, registrar quem recebeu e atualizar o KM do carro', async () => {
    const result = await useCase.execute(valido)

    expect(result.isSuccess).toBe(true)
    const gravado = mockOrdemRepository.create.mock.calls[0][0]
    expect(gravado.numero).toBe(1047)
    expect(gravado.kmEntrada).toBe(30500)
    expect(gravado.historico).toEqual([expect.objectContaining({ status: 'orcamento', por: ATENDENTE })])
    expect(mockVeiculoRepository.update).toHaveBeenCalledWith({ IdVeiculo: VEICULO, dados: { km: 30500 } })
    expect(result.getValue()!.proximosStatus).toEqual(['aprovada', 'cancelada'])
  })

  it('não deve abrir duas OS para o mesmo carro', async () => {
    mockOrdemRepository.findAbertaByVeiculo.mockResolvedValue(Result.ok({ _id: 'os0', numero: 1046 } as any))

    const result = await useCase.execute(valido)

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(result.error?.message).toContain('1046')
    expect(mockOrdemRepository.create).not.toHaveBeenCalled()
  })

  it('não deve aceitar KM menor que o último registrado', async () => {
    const result = await useCase.execute({ ...valido, kmEntrada: 100 })

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(mockOrdemRepository.proximoNumero).not.toHaveBeenCalled()
  })

  it('não deve aceitar carro de outro cliente', async () => {
    const result = await useCase.execute({ ...valido, IdCliente: '6500000000000000000000c9' })

    expect(result.error?.type).toBe('NotAcceptableError')
  })

  it('deve exigir que o responsável seja mecânico', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(
      Result.ok({ _id: MECANICO, nome: 'X', email: 'x@x', papel: 'atendente', ativo: true, createdAt: new Date() }),
    )

    const result = await useCase.execute({ ...valido, IdMecanico: MECANICO })

    expect(result.error?.type).toBe('InvalidFieldError')
  })

  it('não deve aceitar previsão de entrega no passado', async () => {
    const result = await useCase.execute({ ...valido, previsaoEntrega: '2020-01-01' })

    expect(result.error?.type).toBe('InvalidFieldError')
  })

  it('não deve gastar número de OS quando a validação falha', async () => {
    await useCase.execute({ ...valido, relato: 'x' })

    expect(mockOrdemRepository.proximoNumero).not.toHaveBeenCalled()
  })
})
