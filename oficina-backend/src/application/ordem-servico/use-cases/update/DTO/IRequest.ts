export interface IRequest {
  IdOrdemServico: string
  relato?: string
  diagnostico?: string
  itens?: unknown
  desconto?: number | string
  previsaoEntrega?: string | null
  IdMecanico?: string | null
}
