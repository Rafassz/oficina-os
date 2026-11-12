import { Result } from '../../../../../utils'
import { IClienteRepository } from '../../../../cliente/repositories'
import { IVeiculoRepository } from '../../../../veiculo/repositories'
import { IOrdemServicoRepository } from '../../../repositories'
import { GetAllOrdensUseCase } from '../UseCase'

const mockOrdemRepository = { getAll: jest.fn() } as unknown as jest.Mocked<IOrdemServicoRepository>
const mockVeiculoRepository = { findIdsByTrechoPlaca: jest.fn() } as unknown as jest.Mocked<IVeiculoRepository>
const mockClienteRepository = { findIdsByNome: jest.fn() } as unknown as jest.Mocked<IClienteRepository>

describe('GetAllOrdensUseCase', () => {
  const useCase = new GetAllOrdensUseCase({
    repository: {
      ordemServicoRepository: mockOrdemRepository,
      veiculoRepository: mockVeiculoRepository,
      clienteRepository: mockClienteRepository,
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockOrdemRepository.getAll.mockResolvedValue(Result.ok({ itens: [], total: 0 }))
    mockVeiculoRepository.findIdsByTrechoPlaca.mockResolvedValue(Result.ok([]))
    mockClienteRepository.findIdsByNome.mockResolvedValue(Result.ok([]))
  })

  it('aba "em aberto" deve excluir entregues e canceladas', async () => {
    await useCase.execute({ status: 'abertas' })

    expect(mockOrdemRepository.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ statusNotIn: ['entregue', 'cancelada'], statusIn: null, previsaoAntesDe: null }),
    )
  })

  it('aba "atrasadas" não deve contar carro já pronto', async () => {
    await useCase.execute({ status: 'atrasadas' })

    const params = mockOrdemRepository.getAll.mock.calls[0][0]
    expect(params.statusNotIn).toEqual(['entregue', 'cancelada', 'pronta'])
    expect(params.previsaoAntesDe).toBeInstanceOf(Date)
  })

  it('deve aceitar lista de status e recusar status desconhecido', async () => {
    await useCase.execute({ status: 'aprovada,em_execucao' })
    const invalido = await useCase.execute({ status: 'aprovada,voando' })

    expect(mockOrdemRepository.getAll).toHaveBeenCalledWith(expect.objectContaining({ statusIn: ['aprovada', 'em_execucao'] }))
    expect(invalido.error?.type).toBe('InvalidFieldError')
  })

  it('busca numérica deve procurar o número da OS', async () => {
    await useCase.execute({ busca: '1045' })

    expect(mockOrdemRepository.getAll).toHaveBeenCalledWith(expect.objectContaining({ numero: 1045 }))
  })

  it('busca por placa deve usar os veículos encontrados', async () => {
    mockVeiculoRepository.findIdsByTrechoPlaca.mockResolvedValue(Result.ok(['v1']))

    await useCase.execute({ busca: 'ght-7c' })

    expect(mockVeiculoRepository.findIdsByTrechoPlaca).toHaveBeenCalledWith({ trecho: 'GHT7C' })
    expect(mockOrdemRepository.getAll).toHaveBeenCalledWith(expect.objectContaining({ IdsVeiculo: ['v1'], numero: null }))
  })

  it('busca sem nenhum resultado não deve consultar as OS', async () => {
    const result = await useCase.execute({ busca: 'zzz' })

    expect(result.getValue()!.itens).toEqual([])
    expect(mockOrdemRepository.getAll).not.toHaveBeenCalled()
  })
})
