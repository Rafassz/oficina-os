import { Request, Response } from 'express'
import { JwtAuthMiddleware, NotFoundError, Result, UnknownError, WrongCredentials } from '../../../../../utils'
import { GetOrdemByIdController } from '../Controller'
import { IGetOrdemByIdUseCase } from '../UseCase'

const mockUseCase = { execute: jest.fn() } as jest.Mocked<IGetOrdemByIdUseCase>
const mockAuth = { execute: jest.fn() } as unknown as jest.Mocked<JwtAuthMiddleware>

describe('GetOrdemByIdController', () => {
  const controller = new GetOrdemByIdController({
    useCase: { authVerifyUseCase: mockAuth, getOrdemByIdUseCase: mockUseCase },
  })
  const json = jest.fn()
  const end = jest.fn()
  const status = jest.fn().mockReturnValue({ json, end })
  const response = { status } as unknown as Response
  const request = { headers: { authorization: 'Bearer token.de.teste' }, params: { IdOrdemServico: 'x' } } as unknown as Request

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.execute.mockResolvedValue(Result.ok())
  })

  it('deve responder 200 quando o caso de uso tem sucesso', async () => {
    mockUseCase.execute.mockResolvedValue(Result.ok({} as any))

    await controller.handle(request, response)

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1)
    expect(status).toHaveBeenCalledWith(200)
  })

  it('deve responder 401 sem chamar o caso de uso quando a autenticação falha', async () => {
    mockAuth.execute.mockResolvedValue(Result.fail(WrongCredentials()))

    await controller.handle(request, response)

    expect(status).toHaveBeenCalledWith(401)
    expect(mockUseCase.execute).not.toHaveBeenCalled()
  })

  it('deve traduzir NotFoundError em 404', async () => {
    mockUseCase.execute.mockResolvedValue(Result.fail(NotFoundError({ key: 'Registro' })) as never)

    await controller.handle(request, response)

    expect(status).toHaveBeenCalledWith(404)
  })

  it('não deve expor detalhes internos em erro 500', async () => {
    mockUseCase.execute.mockResolvedValue(Result.fail(UnknownError({ error: new Error('stack secreta') })))

    await controller.handle(request, response)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ type: 'UnknownError', message: 'Ocorreu um erro desconhecido' })
  })
})
