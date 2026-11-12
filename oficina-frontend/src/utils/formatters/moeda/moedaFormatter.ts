const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// a API trabalha em centavos
export const moeda = (centavos: number) => moedaFmt.format(centavos / 100)

// "1.250,90" | "1250.9" | "80" -> centavos
export const lerMoeda = (texto: string): number => {
  const limpo = texto.replace(/[^\d,.-]/g, '')
  if (!limpo) return 0
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const valor = Number(normalizado)
  return Number.isFinite(valor) ? Math.round(valor * 100) : 0
}

export const centavosParaTexto = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
