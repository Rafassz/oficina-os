export interface IPagina<T> {
  itens: T[]
  total: number
  pagina: number
  porPagina: number
}

// Retorno dos services para as telas: deu certo com o dado, ou a mensagem para mostrar
export type IResultado<T> = { ok: true; dados: T } | { ok: false; mensagem: string }
