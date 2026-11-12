import bcrypt from 'bcryptjs'
import { DataBaseError, NotFoundError, Result, lerToken } from '../../../../../utils'
import { IUsuarioRepository } from '../../../../usuario/repositories'
import { LoginUseCase } from '../UseCase'

const mockUsuarioRepository = { findByEmail: jest.fn() } as unknown as jest.Mocked<IUsuarioRepository>

const usuario = {
  _id: '6500000000000000000000a1',
  nome: 'Marcos Prado',
  email: 'admin@oficina.local',
  papel: 'admin' as const,
  ativo: true,
  createdAt: new Date(),
  senhaHash: bcrypt.hashSync('oficina123', 4),
}

describe('LoginUseCase', () => {
  const useCase = new LoginUseCase({ repository: { usuarioRepository: mockUsuarioRepository } })

  beforeEach(() => jest.clearAllMocks())

  it('deve devolver token e usuário sem o hash quando a senha confere', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.ok(usuario))

    const result = await useCase.execute({ email: '  Admin@Oficina.local ', senha: 'oficina123' })

    expect(result.isSuccess).toBe(true)
    expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith({ email: 'admin@oficina.local' })
    expect(result.getValue()!.usuario).not.toHaveProperty('senhaHash')
    expect(lerToken(result.getValue()!.token)).toEqual({ IdUsuario: usuario._id, Nome: 'Marcos Prado', Papel: 'admin' })
  })

  it('deve recusar senha errada com a mesma mensagem de e-mail inexistente', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.ok(usuario))
    const senhaErrada = await useCase.execute({ email: usuario.email, senha: 'chute' })

    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.fail(NotFoundError({ key: 'Usuário' })))
    const emailInexistente = await useCase.execute({ email: 'ninguem@x.com', senha: 'chute' })

    expect(senhaErrada.error?.type).toBe('WrongCredentials')
    expect(emailInexistente.error?.type).toBe('WrongCredentials')
    expect(senhaErrada.error?.message).toBe(emailInexistente.error?.message)
  })

  it('deve recusar usuário desativado', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.ok({ ...usuario, ativo: false }))

    const result = await useCase.execute({ email: usuario.email, senha: 'oficina123' })

    expect(result.error?.type).toBe('WrongCredentials')
  })

  it('deve exigir e-mail e senha', async () => {
    expect((await useCase.execute({ senha: 'x' })).error?.type).toBe('RequiredFieldError')
    expect((await useCase.execute({ email: 'a@b.com' })).error?.type).toBe('RequiredFieldError')
    expect(mockUsuarioRepository.findByEmail).not.toHaveBeenCalled()
  })

  it('não deve mascarar falha de banco como credencial inválida', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(Result.fail(DataBaseError()))

    const result = await useCase.execute({ email: usuario.email, senha: 'oficina123' })

    expect(result.error?.type).toBe('DataBaseError')
  })
})
