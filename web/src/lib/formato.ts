const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const moeda = (centavos: number) => moedaFmt.format(centavos / 100);

// "1.250,90" | "1250.9" | "80" -> centavos
export function lerMoeda(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '');
  if (!limpo) return 0;
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const valor = Number(normalizado);
  return Number.isFinite(valor) ? Math.round(valor * 100) : 0;
}

export const centavosParaTexto = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const data = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';

export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const numeroOS = (n: number) => String(n).padStart(5, '0');

export const km = (valor?: number) => (valor === undefined ? '—' : `${valor.toLocaleString('pt-BR')} km`);

export function telefone(t: string) {
  const d = t.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t;
}

export function documento(doc?: string) {
  if (!doc) return '';
  if (doc.length === 11) return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (doc.length === 14) return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return doc;
}

// ABC1234 -> ABC-1234 ; Mercosul fica sem hífen, como na placa de verdade
export function placa(p: string) {
  return /^[A-Z]{3}\d{4}$/.test(p) ? `${p.slice(0, 3)}-${p.slice(3)}` : p;
}

export function linkWhatsApp(tel: string, mensagem: string) {
  const d = tel.replace(/\D/g, '');
  return `https://wa.me/55${d}?text=${encodeURIComponent(mensagem)}`;
}

export function estaAtrasada(previsao: string | null, status: string) {
  if (!previsao || ['pronta', 'entregue', 'cancelada'].includes(status)) return false;
  return new Date(previsao).getTime() < Date.now();
}

// valor para <input type="date">
export const paraInputData = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
