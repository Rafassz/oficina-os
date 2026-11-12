import { NotFoundError, Result } from '../../../../../utils'
import { IClienteRepository } from '../../../repositories'
import { UpdateClienteUseCase } from '../UseCase'

const mockClienteRepository = {
  findByDocumento: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<IClienteRepository>

const ID = '6500000000000000000000c1'
const cliente = { _id: ID, nome: 'Juliana', telefone: '11987451230', createdAt: new Date() }

describe('UpdateClienteUseCase', () => {
  const useCase = new UpdateClienteUseCase({ repository: { clienteRepository: mockClienteRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockClienteRepository.findByDocumento.mockResolvedValue(Result.fail(NotFoundError({ key: 'Cliente' })))
    mockClienteRepository.update.mockResolvedValue(Result.ok(cliente))
  })

  it('deve atualizar só o que foi enviado e apagar opcionais enviados vazios', async () => {
    await useCase.execute({ IdCliente: ID, telefone: '(11) 2222-3333', email: '' })

    expect(mockClienteRepository.update).toHaveBeenCalledWith({
      IdCliente: ID,
      dados: { telefone: '1122223333' },
      remover: ['email'],
    })
  })

  it('deve permitir manter o próprio CPF', async () => {
    mockClienteRepository.findByDocumento.mockResolvedValue(Result.ok({ ...cliente, documento: '32165498700' }))

    const result = await useCase.execute({ IdCliente: ID, documento: '321.654.987-00' })

    expect(result.isSuccess).toBe(true)
  })

  it('deve recusar CPF de outro cliente', async () => {
    mockClienteRepository.findByDocumento.mockResolvedValue(Result.ok({ ...cliente, _id: 'outro' }))

    const result = await useCase.execute({ IdCliente: ID, documento: '32165498700' })

    expect(result.error?.type).toBe('UniqueKeyDuplicateError')
    expect(mockClienteRepository.update).not.toHaveBeenCalled()
  })

  it('deve recusar id malformado sem ir ao banco', async () => {
    const result = await useCase.execute({ IdCliente: 'abc', nome: 'Fulano' })

    expect(result.error?.type).toBe('InvalidFieldError')
    expect(mockClienteRepository.update).not.toHaveBeenCalled()
  })
})
