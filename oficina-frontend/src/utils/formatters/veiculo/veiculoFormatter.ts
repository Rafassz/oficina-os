// ABC1234 -> ABC-1234 ; Mercosul fica sem hífen, como na placa de verdade
export const placa = (p: string) => (/^[A-Z]{3}\d{4}$/.test(p) ? `${p.slice(0, 3)}-${p.slice(3)}` : p)

export const km = (valor?: number) => (valor === undefined ? '—' : `${valor.toLocaleString('pt-BR')} km`)

export const numeroOS = (n: number) => String(n).padStart(5, '0')
