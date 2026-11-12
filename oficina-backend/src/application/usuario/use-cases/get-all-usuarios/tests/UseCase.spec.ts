import { DataBaseError, Result } from '../../../../../utils'
import { IUsuarioRepository } from '../../../repositories'
import { GetAllUsuariosUseCase } from '../UseCase'

const mockUsuarioRepository = {
  getAll: jest.fn(),
} as unknown as jest.Mocked<IUsuarioRepository>

describe('GetAllUsuariosUseCase', () => {
  const useCase = new GetAllUsuariosUseCase({ repository: { usuarioRepository: mockUsuarioRepository } })

  beforeEach(() => jest.clearAllMocks())

  it('deve filtrar pelo papel informado e trazer só ativos', async () => {
    mockUsuarioRepository.getAll.mockResolvedValue(Result.ok([]))

    const result = await useCase.execute({ papel: 'mecanico' })

    expect(result.isSuccess).toBe(true)
    expect(mockUsuarioRepository.getAll).toHaveBeenCalledWith({ papel: 'mecanico', somenteAtivos: true })
  })

  it('deve recusar papel que não existe', async () => {
    const result = await useCase.execute({ papel: 'gerente' })

    expect(result.isFailure).toBe(true)
    expect(result.error?.type).toBe('InvalidFieldError')
    expect(mockUsuarioRepository.getAll).not.toHaveBeenCalled()
  })

  it('deve repassar falha do banco', async () => {
    mockUsuarioRepository.getAll.mockResolvedValue(Result.fail(DataBaseError()))

    const result = await useCase.execute({})

    expect(result.error?.type).toBe('DataBaseError')
  })
})
