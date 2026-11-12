import {
  IDataBaseError,
  IInvalidFieldError,
  INotFoundError,
  IResultError,
  IUnknownError,
  InvalidFieldError,
  Result,
  idValido,
  textoOuVazio,
} from '../../../../utils'
import { IUsuarioRepository } from '../../../usuario/repositories'
import { IItemOS } from '../../models'

export const LIMITES_OS = {
  relatoMin: 3,
  relatoMax: 1000,
  diagnosticoMax: 2000,
  itensMax: 60,
  descricaoMin: 2,
  descricaoMax: 120,
  quantidadeMax: 999,
  obsMax: 300,
}

type ErroCampo = IResultError<IInvalidFieldError>

export const validarRelato = (valor: unknown): { erro: ErroCampo } | { relato: string } => {
  const relato = textoOuVazio(valor)
  if (relato.length < LIMITES_OS.relatoMin || relato.length > LIMITES_OS.relatoMax) {
    return { erro: InvalidFieldError({ key: 'relato', message: 'Descreva o que o cliente relatou' }) }
  }
  return { relato }
}

export const validarItens = (valor: unknown): { erro: ErroCampo } | { itens: IItemOS[] } => {
  if (!Array.isArray(valor)) return { erro: InvalidFieldError({ key: 'itens', message: 'Itens devem ser uma lista' }) }
  if (valor.length > LIMITES_OS.itensMax) {
    return { erro: InvalidFieldError({ key: 'itens', message: `No máximo ${LIMITES_OS.itensMax} itens por OS` }) }
  }

  const itens: IItemOS[] = []
  for (const [i, bruto] of valor.entries()) {
    const linha = `itens.${i}`
    const descricao = textoOuVazio(bruto?.descricao)
    const quantidade = Number(bruto?.quantidade)
    const valorUnitario = Number(bruto?.valorUnitario)

    if (bruto?.tipo !== 'peca' && bruto?.tipo !== 'servico') {
      return { erro: InvalidFieldError({ key: linha, message: `Item ${i + 1}: tipo deve ser peça ou serviço` }) }
    }
    if (descricao.length < LIMITES_OS.descricaoMin || descricao.length > LIMITES_OS.descricaoMax) {
      return { erro: InvalidFieldError({ key: linha, message: `Item ${i + 1}: descreva o item` }) }
    }
    if (!(quantidade > 0) || quantidade > LIMITES_OS.quantidadeMax) {
      return { erro: InvalidFieldError({ key: linha, message: `Item ${i + 1}: quantidade inválida` }) }
    }
    if (!Number.isInteger(valorUnitario) || valorUnitario < 0) {
      return { erro: InvalidFieldError({ key: linha, message: `Item ${i + 1}: valor inválido` }) }
    }
    itens.push({ tipo: bruto.tipo, descricao, quantidade, valorUnitario })
  }
  return { itens }
}

// undefined = não mexer; null = limpar; data = definir
export const lerData = (valor: unknown): { erro: ErroCampo } | { data: Date | null | undefined } => {
  if (valor === undefined) return { data: undefined }
  if (valor === null || valor === '') return { data: null }
  const data = new Date(String(valor))
  if (Number.isNaN(data.getTime())) return { erro: InvalidFieldError({ key: 'previsaoEntrega', message: 'Data inválida' }) }
  return { data }
}

// O responsável precisa ser um mecânico ativo
export const validarMecanico = async (
  usuarioRepository: IUsuarioRepository,
  IdMecanico: unknown,
): Promise<Result<string | null, IResultError<IInvalidFieldError | INotFoundError | IDataBaseError | IUnknownError>>> => {
  if (IdMecanico === null || IdMecanico === undefined || IdMecanico === '') return Result.ok(null)
  if (!idValido(IdMecanico)) return Result.fail(InvalidFieldError({ key: 'mecanico' }))

  const usuario = await usuarioRepository.findById({ IdUsuario: IdMecanico })
  if (usuario.isFailure) return Result.fail(usuario.error!)
  if (usuario.getValue()!.papel !== 'mecanico' || !usuario.getValue()!.ativo) {
    return Result.fail(InvalidFieldError({ key: 'mecanico', message: 'O responsável precisa ser um mecânico ativo' }))
  }
  return Result.ok(IdMecanico)
}
