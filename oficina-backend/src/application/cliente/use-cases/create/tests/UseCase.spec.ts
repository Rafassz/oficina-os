import { NotFoundError, Result } from '../../../../../utils'
import { IClienteRepository } from '../../../repositories'
import { CreateClienteUseCase } from '../UseCase'

const mockClienteRepository = {
  findByDocumento: jest.fn(),
  create: jest.fn(),
} as unknown as jest.Mocked<IClienteRepository>

const clienteGravado = { _id: 'c1', nome: 'Juliana Costa', telefone: '11987451230', createdAt: new Date() }

describe('CreateClienteUseCase', () => {
  const useCase = new CreateClienteUseCase({ repository: { clienteRepository: mockClienteRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockClienteRepository.findByDocumento.mockResolvedValue(Result.fail(NotFoundError({ key: 'Cliente' })))
    mockClienteRepository.create.mockResolvedValue(Result.ok(clienteGravado))
  })

  it('deve gravar telefone e documento só com dígitos', async () => {
    const result = await useCase.execute({
      nome: '  Juliana Costa ',
      telefone: '(11) 98745-1230',
      documento: '321.654.987-00',
    })

    expect(result.isSuccess).toBe(true)
    expect(mockClienteRepository.create).toHaveBeenCalledWith({
      nome: 'Juliana Costa',
      telefone: '11987451230',
      documento: '32165498700',
    })
  })

  it('não deve gravar campos opcionais vazios', async () => {
    await useCase.execute({ nome: 'Antônio Batista', telefone: '11976543210', documento: '', email: '' })

    expect(mockClienteRepository.create).toHaveBeenCalledWith({ nome: 'Antônio Batista', telefone: '11976543210' })
    expect(mockClienteRepository.findByDocumento).not.toHaveBeenCalled()
  })

  it('deve recusar CPF/CNPJ já cadastrado', async () => {
    mockClienteRepository.findByDocumento.mockResolvedValue(Result.ok(clienteGravado))

    const result = await useCase.execute({ nome: 'Outro', telefone: '11999999999', documento: '32165498700' })

    expect(result.error?.type).toBe('UniqueKeyDuplicateError')
    expect(mockClienteRepository.create).not.toHaveBeenCalled()
  })

  it.each([
    [{ telefone: '1199' }, 'InvalidFieldError'],
    [{ telefone: '' }, 'RequiredFieldError'],
    [{ nome: 'Jo' }, 'InvalidFieldError'],
    [{ documento: '123' }, 'InvalidFieldError'],
    [{ email: 'juliana' }, 'InvalidFieldError'],
  ])('deve validar %o', async (alteracao, tipo) => {
    const result = await useCase.execute({ nome: 'Juliana Costa', telefone: '11987451230', ...alteracao })

    expect(result.error?.type).toBe(tipo)
    expect(mockClienteRepository.create).not.toHaveBeenCalled()
  })
})
