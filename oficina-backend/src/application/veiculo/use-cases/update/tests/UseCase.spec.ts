import { NotFoundError, Result } from '../../../../../utils'
import { IVeiculoRepository } from '../../../repositories'
import { UpdateVeiculoUseCase } from '../UseCase'

const mockVeiculoRepository = {
  findById: jest.fn(),
  findByPlaca: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<IVeiculoRepository>

const ID = '6500000000000000000000d1'
const atual = { _id: ID, cliente: 'c1', placa: 'EZP4410', marca: 'Chevrolet', modelo: 'Onix', km: 131000 }

describe('UpdateVeiculoUseCase', () => {
  const useCase = new UpdateVeiculoUseCase({ repository: { veiculoRepository: mockVeiculoRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockVeiculoRepository.findById.mockResolvedValue(Result.ok(atual))
    mockVeiculoRepository.findByPlaca.mockResolvedValue(Result.fail(NotFoundError({ key: 'Veículo' })))
    mockVeiculoRepository.update.mockResolvedValue(Result.ok(atual))
  })

  it('não deve deixar o KM voltar', async () => {
    const result = await useCase.execute({ IdVeiculo: ID, km: 120000 })

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(mockVeiculoRepository.update).not.toHaveBeenCalled()
  })

  it('não deve checar duplicidade quando a placa não mudou', async () => {
    await useCase.execute({ IdVeiculo: ID, placa: 'EZP-4410', cor: 'Prata' })

    expect(mockVeiculoRepository.findByPlaca).not.toHaveBeenCalled()
    expect(mockVeiculoRepository.update).toHaveBeenCalledWith({ IdVeiculo: ID, dados: { placa: 'EZP4410', cor: 'Prata' } })
  })

  it('deve recusar trocar para placa de outro veículo', async () => {
    mockVeiculoRepository.findByPlaca.mockResolvedValue(Result.ok({ ...atual, _id: 'outro', placa: 'ABC1234' }))

    const result = await useCase.execute({ IdVeiculo: ID, placa: 'ABC1234' })

    expect(result.error?.type).toBe('UniqueKeyDuplicateError')
  })
})
