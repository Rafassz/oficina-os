import { Result } from '../../../../../utils'
import { IClienteRepository } from '../../../repositories'
import { GetAllClientesUseCase } from '../UseCase'

const mockClienteRepository = { getAll: jest.fn() } as unknown as jest.Mocked<IClienteRepository>

describe('GetAllClientesUseCase', () => {
  const useCase = new GetAllClientesUseCase({ repository: { clienteRepository: mockClienteRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockClienteRepository.getAll.mockResolvedValue(Result.ok({ itens: [], total: 0, pagina: 1, porPagina: 20 }))
  })

  it('deve buscar telefone pelos dígitos digitados', async () => {
    await useCase.execute({ busca: '(11) 9874' })

    expect(mockClienteRepository.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ nome: '(11) 9874', digitos: '119874' }),
    )
  })

  it('não deve buscar por dígitos com menos de 3 números', async () => {
    await useCase.execute({ busca: 'Ed 1' })

    expect(mockClienteRepository.getAll).toHaveBeenCalledWith(expect.objectContaining({ digitos: null }))
  })

  it('deve limitar a paginação', async () => {
    await useCase.execute({ pagina: '-3', porPagina: '5000' })

    expect(mockClienteRepository.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ nome: null, pagina: 1, porPagina: 100 }),
    )
  })
})
