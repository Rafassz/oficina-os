import { IUsuario } from '../../../../usuario/models'

export interface IResponse {
  token: string
  usuario: IUsuario
}
