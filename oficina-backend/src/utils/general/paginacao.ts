export const POR_PAGINA_PADRAO = 20
export const POR_PAGINA_MAXIMO = 100

// query string -> números seguros para skip/limit
export const lerPaginacao = (pagina?: string, porPagina?: string) => ({
  pagina: Math.max(1, Number.parseInt(pagina ?? '', 10) || 1),
  porPagina: Math.min(POR_PAGINA_MAXIMO, Math.max(1, Number.parseInt(porPagina ?? '', 10) || POR_PAGINA_PADRAO)),
})
