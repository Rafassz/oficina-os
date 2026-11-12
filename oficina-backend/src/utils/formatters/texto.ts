export const somenteDigitos = (valor: string) => valor.replace(/\D/g, '')

export const normalizarPlaca = (valor: string) => valor.toUpperCase().replace(/[^A-Z0-9]/g, '')

export const escaparRegex = (valor: string) => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const textoOuVazio = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '')
