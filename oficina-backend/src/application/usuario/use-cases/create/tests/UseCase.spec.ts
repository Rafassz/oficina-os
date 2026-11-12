import bcrypt from 'bcryptjs'
import { NotFoundError, Result, gerarToken } from '../../../../../utils'
import { IUsuarioRepository } from '../../../repositories'
import { CreateUsuarioUseCase } from '../UseCase'

const mockUsuarioRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
} as unknown as jest.Mocked<IUsuarioRepository>

const token = gerarToken({ IdUsuario: '6500000000000000000000a1', Nome: 'Marcos', Papel: 'admin' })
const pessoa = (papel: 'admin' | 'mecanico') => ({
  _id: '6500000000000000000000a1',
  nome: 'Marcos',
  email: 'admin@oficina.local',
  papel,
  ativo: true,
  createdAt: new Date(),
})

const valido = { nome: 'Carlos Henrique', email: 'Carlos@Oficina.local', senha: 'segredo1', papel: 'mecanico', token }

describe('CreateUsuarioUseCase', () => {
  const useCase = new CreateUsuarioUseCase({ repository: { usuarioRepository: mockUsuarioRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsuarioRepository.findById.mockResolvedValue(Result.ok(pessoa('admin')))
    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.fail(NotFoundError({ key: 'Usuário' })))
    mockUsuarioRepository.create.mockImplementation(async (d) =>
      Result.ok({ _id: 'novo', nome: d.nome, email: d.email, papel: d.papel, ativo: true, createdAt: new Date() }),
    )
  })

  it('deve criar com e-mail normalizado e senha com hash', async () => {
    const result = await useCase.execute(valido)

    expect(result.isSuccess).toBe(true)
    const gravado = mockUsuarioRepository.create.mock.calls[0][0]
    expect(gravado.email).toBe('carlos@oficina.local')
    expect(gravado.senhaHash).not.toBe('segredo1')
    expect(await bcrypt.compare('segredo1', gravado.senhaHash)).toBe(true)
  })

  it('deve permitir só administradores', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(Result.ok(pessoa('mecanico')))

    const result = await useCase.execute(valido)

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(mockUsuarioRepository.create).not.toHaveBeenCalled()
  })

  it('deve recusar e-mail já cadastrado', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.ok({ ...pessoa('mecanico'), senhaHash: 'x' }))

    const result = await useCase.execute(valido)

    expect(result.error?.type).toBe('UniqueKeyDuplicateError')
  })

  it.each([
    [{ senha: '123' }, 'InvalidFieldError'],
    [{ papel: 'gerente' }, 'InvalidFieldError'],
    [{ email: 'sem-arroba' }, 'InvalidFieldError'],
    [{ nome: '' }, 'RequiredFieldError'],
  ])('deve validar %o', async (alteracao, tipo) => {
    const result = await useCase.execute({ ...valido, ...alteracao })

    expect(result.error?.type).toBe(tipo)
    expect(mockUsuarioRepository.create).not.toHaveBeenCalled()
  })
})
