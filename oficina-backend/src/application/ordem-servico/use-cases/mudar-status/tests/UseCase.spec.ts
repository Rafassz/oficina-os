import { Result, gerarToken } from '../../../../../utils'
import { IOrdemServico } from '../../../models'
import { IOrdemServicoRepository } from '../../../repositories'
import { MudarStatusOrdemUseCase } from '../UseCase'

const mockOrdemRepository = {
  findById: jest.fn(),
  update: jest.fn(),
  findDetalhadaById: jest.fn(),
} as unknown as jest.Mocked<IOrdemServicoRepository>

const ID = '6500000000000000000000e1'
const MECANICO = '6500000000000000000000a2'
const token = gerarToken({ IdUsuario: MECANICO, Nome: 'Carlos', Papel: 'mecanico' })

const ordem = (status: IOrdemServico['status'], comItens = true) =>
  ({
    _id: ID,
    status,
    desconto: 0,
    itens: comItens ? [{ tipo: 'servico', descricao: 'Revisão', quantidade: 1, valorUnitario: 20000 }] : [],
  }) as IOrdemServico

describe('MudarStatusOrdemUseCase', () => {
  const useCase = new MudarStatusOrdemUseCase({ repository: { ordemServicoRepository: mockOrdemRepository } })

  beforeEach(() => {
    jest.clearAllMocks()
    mockOrdemRepository.update.mockResolvedValue(Result.ok(ordem('aprovada')))
    mockOrdemRepository.findDetalhadaById.mockResolvedValue(Result.ok(ordem('aprovada') as any))
  })

  it('deve avançar no fluxo registrando quem mudou', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('orcamento')))

    const result = await useCase.execute({ IdOrdemServico: ID, status: 'aprovada', token })

    expect(result.isSuccess).toBe(true)
    expect(mockOrdemRepository.update).toHaveBeenCalledWith({
      IdOrdemServico: ID,
      dados: { status: 'aprovada' },
      novoEvento: expect.objectContaining({ status: 'aprovada', por: MECANICO }),
    })
  })

  it('deve marcar a data de entrega ao entregar', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('pronta')))

    await useCase.execute({ IdOrdemServico: ID, status: 'entregue', token })

    expect(mockOrdemRepository.update.mock.calls[0][0].dados.entregueEm).toBeInstanceOf(Date)
  })

  it('não deve pular etapas', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('orcamento')))

    const result = await useCase.execute({ IdOrdemServico: ID, status: 'pronta', token })

    expect(result.error?.type).toBe('NotAcceptableError')
    expect(mockOrdemRepository.update).not.toHaveBeenCalled()
  })

  it('não deve reabrir OS entregue', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('entregue')))

    const result = await useCase.execute({ IdOrdemServico: ID, status: 'em_execucao', token })

    expect(result.error?.type).toBe('NotAcceptableError')
  })

  it('não deve aprovar orçamento vazio', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('orcamento', false)))

    const result = await useCase.execute({ IdOrdemServico: ID, status: 'aprovada', token })

    expect(result.error?.message).toContain('ao menos um item')
  })

  it('deve exigir motivo para cancelar', async () => {
    mockOrdemRepository.findById.mockResolvedValue(Result.ok(ordem('orcamento')))

    const semMotivo = await useCase.execute({ IdOrdemServico: ID, status: 'cancelada', obs: '  ', token })
    const comMotivo = await useCase.execute({ IdOrdemServico: ID, status: 'cancelada', obs: 'Cliente desistiu', token })

    expect(semMotivo.error?.type).toBe('RequiredFieldError')
    expect(comMotivo.isSuccess).toBe(true)
  })

  it('deve recusar status inexistente', async () => {
    const result = await useCase.execute({ IdOrdemServico: ID, status: 'voando', token })

    expect(result.error?.type).toBe('InvalidFieldError')
    expect(mockOrdemRepository.findById).not.toHaveBeenCalled()
  })
})
