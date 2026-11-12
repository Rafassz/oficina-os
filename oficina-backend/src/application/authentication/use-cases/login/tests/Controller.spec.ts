import { Request, Response } from 'express'
import { NotFoundError, Result, UnknownError } from '../../../../../utils'
import { LoginController } from '../Controller'
import { ILoginUseCase } from '../UseCase'

const mockUseCase = { execute: jest.fn() } as jest.Mocked<ILoginUseCase>

describe('LoginController', () => {
  const controller = new LoginController({
    useCase: { loginUseCase: mockUseCase },
  })
  const json = jest.fn()
  const end = jest.fn()
  const status = jest.fn().mockReturnValue({ json, end })
  const response = { status } as unknown as Response
  const request = { headers: { authorization: 'Bearer token.de.teste' }, body: { email: 'a@b.com', senha: 'x' } } as unknown as Request

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve responder 200 quando o caso de uso tem sucesso', async () => {
    mockUseCase.execute.mockResolvedValue(Result.ok({} as any))

    await controller.handle(request, response)

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1)
    expect(status).toHaveBeenCalledWith(200)
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
