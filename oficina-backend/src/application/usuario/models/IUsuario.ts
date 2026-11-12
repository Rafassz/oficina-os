import { IPapel } from '../../../utils'

export interface IUsuario {
  _id: string
  nome: string
  email: string
  papel: IPapel
  ativo: boolean
  createdAt: Date
}

// Só o caso de uso de login enxerga o hash
export interface IUsuarioComSenha extends IUsuario {
  senhaHash: string
}

export const PAPEIS: IPapel[] = ['admin', 'atendente', 'mecanico']
