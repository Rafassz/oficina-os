// Placa no padrão antigo (ABC1234) ou Mercosul (ABC1D23)
const PLACA_ANTIGA = /^[A-Z]{3}\d{4}$/;
const PLACA_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function normalizarPlaca(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function placaValida(placa: string) {
  return PLACA_ANTIGA.test(placa) || PLACA_MERCOSUL.test(placa);
}

export function escaparRegex(valor: string) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}
