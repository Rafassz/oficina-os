import { Result } from '../../../../../utils'
import { IVeiculoRepository } from '../../../repositories'
import { GetVeiculosByPlacaUseCase } from '../UseCase'

const mockVeiculoRepository = { searchByPlaca: jest.fn() } as unknown as jest.Mocked<IVeiculoRepository>

describe('GetVeiculosByPlacaUseCase', () => {
  const useCase = new GetVeiculosByPlacaUseCase({ repository: { veiculoRepository: mockVeiculoRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockVeiculoRepository.searchByPlaca.mockResolvedValue(Result.ok([]))
  })

  it('deve buscar pelo começo da placa normalizada', async () => {
    await useCase.execute({ placa: 'ght-7' })

    expect(mockVeiculoRepository.searchByPlaca).toHaveBeenCalledWith({ prefixo: 'GHT7', limite: 10 })
  })

  it('não deve ir ao banco com busca vazia', async () => {
    const result = await useCase.execute({ placa: ' - ' })

    expect(result.getValue()).toEqual([])
    expect(mockVeiculoRepository.searchByPlaca).not.toHaveBeenCalled()
  })
})
