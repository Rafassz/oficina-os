import { DataBaseError, Result } from '../../../../../utils'
import { IOrdemServicoRepository } from '../../../../ordem-servico/repositories'
import { GetDashboardSummaryUseCase } from '../UseCase'

const mockOrdemRepository = {
  contarPorStatus: jest.fn(),
  contarAtrasadas: jest.fn(),
  getEntreguesDesde: jest.fn(),
  getProximasEntregas: jest.fn(),
} as unknown as jest.Mocked<IOrdemServicoRepository>

describe('GetDashboardSummaryUseCase', () => {
  const useCase = new GetDashboardSummaryUseCase({ repository: { ordemServicoRepository: mockOrdemRepository } })
  const agora = new Date(2026, 10, 11, 15, 0)

  beforeEach(() => {
    jest.clearAllMocks()
    mockOrdemRepository.contarPorStatus.mockResolvedValue(Result.ok({ orcamento: 1, em_execucao: 2, pronta: 1 }))
    mockOrdemRepository.contarAtrasadas.mockResolvedValue(Result.ok(1))
    mockOrdemRepository.getEntreguesDesde.mockResolvedValue(
      Result.ok([
        { itens: [{ tipo: 'servico', descricao: 'a', quantidade: 1, valorUnitario: 66490 }], desconto: 1000 },
        { itens: [{ tipo: 'peca', descricao: 'b', quantidade: 2, valorUnitario: 27750 }], desconto: 0 },
      ]),
    )
    mockOrdemRepository.getProximasEntregas.mockResolvedValue(Result.ok([]))
  })

  it('deve calcular faturamento e ticket médio das OS entregues no mês', async () => {
    const result = await useCase.execute({ agora })

    expect(mockOrdemRepository.getEntreguesDesde).toHaveBeenCalledWith({ desde: new Date(2026, 10, 1) })
    expect(result.getValue()).toEqual(
      expect.objectContaining({ emAberto: 4, atrasadas: 1, faturamentoMes: 120990, entreguesMes: 2, ticketMedio: 60495 }),
    )
  })

  it('não deve contar como atrasado carro que já está pronto', async () => {
    await useCase.execute({ agora })

    expect(mockOrdemRepository.contarAtrasadas).toHaveBeenCalledWith({
      statusNotIn: ['entregue', 'cancelada', 'pronta'],
      agora,
    })
  })

  it('mês sem entregas deve ter ticket médio zero', async () => {
    mockOrdemRepository.getEntreguesDesde.mockResolvedValue(Result.ok([]))

    const result = await useCase.execute({ agora })

    expect(result.getValue()!.ticketMedio).toBe(0)
  })

  it('deve repassar falha do banco', async () => {
    mockOrdemRepository.contarAtrasadas.mockResolvedValue(Result.fail(DataBaseError()))

    const result = await useCase.execute({ agora })

    expect(result.error?.type).toBe('DataBaseError')
  })
})
