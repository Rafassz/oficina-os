import { NotFoundError, Result } from '../../../../../utils'
import { IOrdemServicoRepository } from '../../../repositories'
import { GetOrdemByIdUseCase } from '../UseCase'

const mockOrdemRepository = { findDetalhadaById: jest.fn() } as unknown as jest.Mocked<IOrdemServicoRepository>
const ID = '6500000000000000000000e1'

describe('GetOrdemByIdUseCase', () => {
  const useCase = new GetOrdemByIdUseCase({ repository: { ordemServicoRepository: mockOrdemRepository } })

  beforeEach(() => jest.clearAllMocks())

  it('deve devolver a OS com totais e próximos passos', async () => {
    mockOrdemRepository.findDetalhadaById.mockResolvedValue(
      Result.ok({
        _id: ID,
        status: 'pronta',
        desconto: 0,
        itens: [{ tipo: 'peca', descricao: 'Correia', quantidade: 1, valorUnitario: 32000 }],
      } as any),
    )

    const result = await useCase.execute({ IdOrdemServico: ID })

    expect(result.getValue()).toEqual(
      expect.objectContaining({ total: 32000, proximosStatus: ['entregue', 'em_execucao'] }),
    )
  })

  it('deve devolver NotFoundError quando não existe', async () => {
    mockOrdemRepository.findDetalhadaById.mockResolvedValue(Result.fail(NotFoundError({ key: 'Ordem de serviço' })))

    const result = await useCase.execute({ IdOrdemServico: ID })

    expect(result.error?.type).toBe('NotFoundError')
  })

  it('deve recusar id malformado', async () => {
    const result = await useCase.execute({ IdOrdemServico: '123' })

    expect(result.error?.type).toBe('InvalidFieldError')
    expect(mockOrdemRepository.findDetalhadaById).not.toHaveBeenCalled()
  })
})
