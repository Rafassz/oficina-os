import { NotFoundError, Result } from '../../../../../utils'
import { IClienteRepository } from '../../../../cliente/repositories'
import { IVeiculoRepository } from '../../../repositories'
import { CreateVeiculoUseCase } from '../UseCase'

const mockVeiculoRepository = { findByPlaca: jest.fn(), create: jest.fn() } as unknown as jest.Mocked<IVeiculoRepository>
const mockClienteRepository = { findById: jest.fn() } as unknown as jest.Mocked<IClienteRepository>

const DONO = '6500000000000000000000c1'
const valido = { IdCliente: DONO, placa: 'abc-1d23', marca: 'Fiat', modelo: 'Mobi', km: '30000' }

describe('CreateVeiculoUseCase', () => {
  const useCase = new CreateVeiculoUseCase({
    repository: { veiculoRepository: mockVeiculoRepository, clienteRepository: mockClienteRepository },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockClienteRepository.findById.mockResolvedValue(
      Result.ok({ _id: DONO, nome: 'Teste', telefone: '11912345678', createdAt: new Date() }),
    )
    mockVeiculoRepository.findByPlaca.mockResolvedValue(Result.fail(NotFoundError({ key: 'Veículo' })))
    mockVeiculoRepository.create.mockImplementation(async (d) => Result.ok({ _id: 'v1', ...d }))
  })

  it('deve normalizar a placa Mercosul e converter o KM', async () => {
    const result = await useCase.execute(valido)

    expect(result.isSuccess).toBe(true)
    expect(mockVeiculoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ cliente: DONO, placa: 'ABC1D23', km: 30000 }),
    )
  })

  it('deve recusar placa já cadastrada', async () => {
    mockVeiculoRepository.findByPlaca.mockResolvedValue(Result.ok({ _id: 'x' } as any))

    const result = await useCase.execute(valido)

    expect(result.error?.type).toBe('UniqueKeyDuplicateError')
  })

  it('deve exigir um cliente existente', async () => {
    mockClienteRepository.findById.mockResolvedValue(Result.fail(NotFoundError({ key: 'Cliente' })))

    const result = await useCase.execute(valido)

    expect(result.error?.type).toBe('NotFoundError')
    expect(mockVeiculoRepository.create).not.toHaveBeenCalled()
  })

  it.each([
    [{ placa: 'AB12' }, 'InvalidFieldError'],
    [{ ano: 1900 }, 'InvalidFieldError'],
    [{ ano: new Date().getFullYear() + 2 }, 'InvalidFieldError'],
    [{ km: -5 }, 'InvalidFieldError'],
    [{ marca: '' }, 'RequiredFieldError'],
  ])('deve validar %o', async (alteracao, tipo) => {
    const result = await useCase.execute({ ...valido, ...alteracao })

    expect(result.error?.type).toBe(tipo)
  })
})
