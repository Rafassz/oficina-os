export type IPapel = 'admin' | 'atendente' | 'mecanico'

export interface ITokenPayload {
  IdUsuario: string
  Nome: string
  Papel: IPapel
}
