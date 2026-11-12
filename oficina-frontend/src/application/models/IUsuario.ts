export type IPapel = 'admin' | 'atendente' | 'mecanico'

export interface IUsuario {
  _id: string
  nome: string
  email: string
  papel: IPapel
  ativo: boolean
}

export interface ISessao {
  token: string
  usuario: IUsuario
}
