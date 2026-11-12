import { Result } from '../../../../../utils'
import { IUsuarioRepository } from '../../../../usuario/repositories'
import { IOrdemServico } from '../../../models'
import { IOrdemServicoRepository } from '../../../repositories'
import { UpdateOrdemUseCase } from '../UseCase'

const mockOrdemRepository = {
  findById: jest.fn(),
  update: jest.fn(),
  findDetalhadaById: jest.fn(),
} as unknown as jest.Mocked<IOrdemServicoRepository>
const mockUsuarioRepository = { findById: jest.fn() } as unknown as jest.Mocked<IUsuarioRepository>

const ID = '6500000000000000000000e1'
const ordem = (status: IOrdemServico['status']) =>
  ({
    _id: ID,
    status,
    desconto: 0,
    itens: [{ tipo: 'servico', descricao: 'Mão de obra', quantidade: 1, valorUnitario: 8000 }],
  }) as IOrdemServico

const itensValidos = [
  { tipo: 'peca', descricao: 'Pastilha', quantidade: 1, valorUnitario: 14500 },
  { tipo: 'servico', descricao: 'Mão de obra', quantidade: 1, valorUnitario: 8000 },
]

describe('UpdateOrdemUseCase', () => {
  const useCase = new UpdateOrdemUseCase({
    repository: { ordemServicoRepository: mockOrdemRepository, usuarioRepository: mockUsuarioRepository },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('orcamento')))
    mockOrdemRepository.update.mockResolvedValue(Result.ok(ordem('orcamento')))
    mockOrdemRepository.findDetalhadaById.mockResolvedValue(
      Result.ok({ ...ordem('orcamento'), itens: itensValidos, desconto: 500 } as any),
    )
  })

  it('deve gravar itens e desconto e devolver os totais calculados', async () => {
    const result = await useCase.execute({ IdOrdemServico: ID, itens: itensValidos, desconto: 500 })

    expect(mockOrdemRepository.update).toHaveBeenCalledWith({
      IdOrdemServico: ID,
      dados: { itens: itensValidos, desconto: 500 },
    })
    expect(result.getValue()).toEqual(expect.objectContaining({ totalPecas: 14500, totalServicos: 8000, total: 22000 }))
  })

  it('não deve deixar o desconto passar do valor da OS', async () => {
    const result = await useCase.execute({ IdOrdemServico: ID, desconto: 9000 })

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(mockOrdemRepository.update).not.toHaveBeenCalled()
  })

  it('deve travar os valores depois de pronta, mas permitir mexer no prazo', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('pronta')))

    const itens = await useCase.execute({ IdOrdemServico: ID, itens: itensValidos })
    const prazo = await useCase.execute({ IdOrdemServico: ID, previsaoEntrega: '2026-12-01' })

    expect(itens.error?.type).toBe('NotAcceptableError')
    expect(prazo.isSuccess).toBe(true)
  })

  it('não deve alterar OS entregue', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('entregue')))

    const result = await useCase.execute({ IdOrdemServico: ID, diagnostico: 'x' })

    expect(result.error?.type).toBe('NotAcceptableError')
  })

  it.each([
    [[{ tipo: 'brinde', descricao: 'Chaveiro', quantidade: 1, valorUnitario: 0 }]],
    [[{ tipo: 'peca', descricao: 'P', quantidade: 1, valorUnitario: 100 }]],
    [[{ tipo: 'peca', descricao: 'Pastilha', quantidade: 0, valorUnitario: 100 }]],
    [[{ tipo: 'peca', descricao: 'Pastilha', quantidade: 1, valorUnitario: 10.5 }]],
  ])('deve recusar item inválido %o', async (itens) => {
    const result = await useCase.execute({ IdOrdemServico: ID, itens })

    expect(result.error?.type).toBe('InvalidFieldError')
  })

  it('deve permitir tirar o mecânico da OS', async () => {
    await useCase.execute({ IdOrdemServico: ID, IdMecanico: null })

    expect(mockOrdemRepository.update).toHaveBeenCalledWith({ IdOrdemServico: ID, dados: { mecanico: null } })
  })
})
