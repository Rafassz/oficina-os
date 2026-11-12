import { NotFoundError, Result } from '../../../../../utils'
import { IOrdemServicoRepository } from '../../../../ordem-servico/repositories'
import { IVeiculoRepository } from '../../../../veiculo/repositories'
import { IClienteRepository } from '../../../repositories'
import { DeleteClienteUseCase } from '../UseCase'

const mockClienteRepository = { delete: jest.fn() } as unknown as jest.Mocked<IClienteRepository>
const mockVeiculoRepository = { deleteByCliente: jest.fn() } as unknown as jest.Mocked<IVeiculoRepository>
const mockOrdemRepository = { existsByCliente: jest.fn() } as unknown as jest.Mocked<IOrdemServicoRepository>

const ID = '6500000000000000000000c1'

describe('DeleteClienteUseCase', () => {
  const useCase = new DeleteClienteUseCase({
    repository: {
      clienteRepository: mockClienteRepository,
      veiculoRepository: mockVeiculoRepository,
      ordemServicoRepository: mockOrdemRepository,
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockOrdemRepository.existsByCliente.mockResolvedValue(Result.ok(false))
    mockClienteRepository.delete.mockResolvedValue(Result.ok())
    mockVeiculoRepository.deleteByCliente.mockResolvedValue(Result.ok())
  })

  it('deve excluir o cliente e os veículos dele', async () => {
    const result = await useCase.execute({ IdCliente: ID })

    expect(result.isSuccess).toBe(true)
    expect(mockVeiculoRepository.deleteByCliente).toHaveBeenCalledWith({ IdCliente: ID })
  })

  it('não deve excluir cliente com OS registrada', async () => {
    mockOrdemRepository.existsByCliente.mockResolvedValue(Result.ok(true))

    const result = await useCase.execute({ IdCliente: ID })

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(mockClienteRepository.delete).not.toHaveBeenCalled()
  })

  it('não deve apagar veículos se o cliente não existir', async () => {
    mockClienteRepository.delete.mockResolvedValue(Result.fail(NotFoundError({ key: 'Cliente' })))

    const result = await useCase.execute({ IdCliente: ID })

    expect(result.error?.type).toBe('NotFoundError')
    expect(mockVeiculoRepository.deleteByCliente).not.toHaveBeenCalled()
  })
})
