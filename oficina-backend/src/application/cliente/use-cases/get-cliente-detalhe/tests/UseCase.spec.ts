import { NotFoundError, Result } from '../../../../../utils'
import { IOrdemServicoDetalhada } from '../../../../ordem-servico/models'
import { IOrdemServicoRepository } from '../../../../ordem-servico/repositories'
import { IVeiculoRepository } from '../../../../veiculo/repositories'
import { IClienteRepository } from '../../../repositories'
import { GetClienteDetalheUseCase } from '../UseCase'

const mockClienteRepository = { findById: jest.fn() } as unknown as jest.Mocked<IClienteRepository>
const mockVeiculoRepository = { getByCliente: jest.fn() } as unknown as jest.Mocked<IVeiculoRepository>
const mockOrdemRepository = { getByCliente: jest.fn() } as unknown as jest.Mocked<IOrdemServicoRepository>

const ID = '6500000000000000000000c1'

const os = (status: IOrdemServicoDetalhada['status'], valor: number) =>
  ({
    _id: status,
    numero: 1,
    status,
    itens: [{ tipo: 'servico', descricao: 'x', quantidade: 1, valorUnitario: valor }],
    desconto: 0,
  }) as unknown as IOrdemServicoDetalhada

describe('GetClienteDetalheUseCase', () => {
  const useCase = new GetClienteDetalheUseCase({
    repository: {
      clienteRepository: mockClienteRepository,
      veiculoRepository: mockVeiculoRepository,
      ordemServicoRepository: mockOrdemRepository,
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockClienteRepository.findById.mockResolvedValue(
      Result.ok({ _id: ID, nome: 'Antônio', telefone: '11976543210', createdAt: new Date() }),
    )
    mockVeiculoRepository.getByCliente.mockResolvedValue(Result.ok([]))
  })

  it('deve somar no total gasto só as OS entregues', async () => {
    mockOrdemRepository.getByCliente.mockResolvedValue(
      Result.ok([os('entregue', 55500), os('em_execucao', 30000), os('entregue', 10000)]),
    )

    const result = await useCase.execute({ IdCliente: ID })

    expect(result.getValue()!.totalGasto).toBe(65500)
    expect(result.getValue()!.ordens[1].total).toBe(30000)
  })

  it('deve devolver 404 sem buscar veículos quando o cliente não existe', async () => {
    mockClienteRepository.findById.mockResolvedValue(Result.fail(NotFoundError({ key: 'Cliente' })))

    const result = await useCase.execute({ IdCliente: ID })

    expect(result.error?.type).toBe('NotFoundError')
    expect(mockVeiculoRepository.getByCliente).not.toHaveBeenCalled()
  })
})
