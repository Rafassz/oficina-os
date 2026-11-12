export interface IRequest {
  IdCliente?: string
  IdVeiculo?: string
  IdMecanico?: string
  kmEntrada?: number | string
  relato?: string
  previsaoEntrega?: string
  token: string
}
