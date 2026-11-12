export interface ICliente {
  _id: string
  nome: string
  telefone: string
  // CPF ou CNPJ, só dígitos. Opcional: muito cliente de balcão não informa.
  documento?: string
  email?: string
  observacoes?: string
  createdAt: Date
}

export interface IClientePaginado {
  itens: ICliente[]
  total: number
  pagina: number
  porPagina: number
}
