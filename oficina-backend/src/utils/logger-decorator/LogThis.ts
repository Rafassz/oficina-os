import { env } from '../env'
import { Result, UnknownError } from '../result'

// Envolve o execute() do UseCase: loga no modo dev e transforma exceção em UnknownError
export function LogThis(useCaseName: string) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const metodoOriginal = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const inicio = Date.now()
      try {
        const resultado = await metodoOriginal.apply(this, args)
        if (env.dev_mode) {
          const situacao = resultado?.isFailure ? `falha (${resultado.error?.type})` : 'ok'
          console.log(`[${useCaseName}] ${situacao} em ${Date.now() - inicio}ms`)
        }
        return resultado
      } catch (error) {
        console.error(`[${useCaseName}] exceção não tratada`, error)
        return Result.fail(UnknownError({ error }))
      }
    }
    return descriptor
  }
}
