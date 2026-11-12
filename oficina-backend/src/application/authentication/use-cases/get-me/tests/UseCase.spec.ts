import { Result, gerarToken } from '../../../../../utils'
import { IUsuarioRepository } from '../../../../usuario/repositories'
import { GetMeUseCase } from '../UseCase'

const mockUsuarioRepository = { findById: jest.fn() } as unknown as jest.Mocked<IUsuarioRepository>
const token = gerarToken({ IdUsuario: '6500000000000000000000a1', Nome: 'Marcos', Papel: 'admin' })
const usuario = {
  _id: '6500000000000000000000a1',
  nome: 'Marcos',
  email: 'a@b.com',
  papel: 'admin' as const,
  ativo: true,
  createdAt: new Date(),
}

describe('GetMeUseCase', () => {
  const useCase = new GetMeUseCase({ repository: { usuarioRepository: mockUsuarioRepository } })

  beforeEach(() => jest.clearAllMocks())

  it('deve buscar o usuário dono do token', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(Result.ok(usuario))

    const result = await useCase.execute({ token })

    expect(mockUsuarioRepository.findById).toHaveBeenCalledWith({ IdUsuario: usuario._id })
    expect(result.getValue()).toEqual(usuario)
  })

  it('deve recusar usuário desativado depois do login', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(Result.ok({ ...usuario, ativo: false }))

    const result = await useCase.execute({ token })

    expect(result.error?.type).toBe('WrongCredentials')
  })

  it('deve transformar token inválido em UnknownError sem derrubar a API', async () => {
    const result = await useCase.execute({ token: 'lixo' })

    expect(result.isFailure).toBe(true)
  })
})
