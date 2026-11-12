import { isValidObjectId } from 'mongoose'

// Placa no padrão antigo (ABC1234) ou Mercosul (ABC1D23)
export const placaValida = (placa: string) => /^[A-Z]{3}\d{4}$/.test(placa) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placa)

export const telefoneValido = (digitos: string) => digitos.length === 10 || digitos.length === 11

export const documentoValido = (digitos: string) => digitos.length === 11 || digitos.length === 14

export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const idValido = (id: unknown): id is string => typeof id === 'string' && isValidObjectId(id)
