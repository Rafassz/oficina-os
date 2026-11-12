export interface IRequest {
  // 'abertas' | 'atrasadas' | lista separada por vírgula (ex.: 'aprovada,em_execucao') | vazio = todas
  status?: string
  // número da OS, placa ou nome do cliente
  busca?: string
  pagina?: string
  porPagina?: string
}
