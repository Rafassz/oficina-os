import type { ReactNode } from 'react';
import type { StatusOS } from '../types';
import { ROTULO_STATUS } from '../lib/status';
import { placa as formatarPlaca } from '../lib/formato';

export function StatusTag({ status }: { status: StatusOS }) {
  return <span className={`tag tag-${status}`}>{ROTULO_STATUS[status]}</span>;
}

// Placa desenhada parecida com a física, ajuda o olho a achar o carro na lista
export function Placa({ valor, grande }: { valor: string; grande?: boolean }) {
  return <span className={`placa${grande ? ' placa-grande' : ''}`}>{formatarPlaca(valor)}</span>;
}

export function Aviso({ children, tipo = 'erro' }: { children: ReactNode; tipo?: 'erro' | 'ok' }) {
  if (!children) return null;
  return (
    <p className={`aviso aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function Carregando() {
  return <p className="vazio">Carregando…</p>;
}

export function Paginacao({
  pagina,
  total,
  porPagina,
  onMudar,
}: {
  pagina: number;
  total: number;
  porPagina: number;
  onMudar: (p: number) => void;
}) {
  const paginas = Math.ceil(total / porPagina);
  if (paginas <= 1) return null;
  return (
    <div className="paginacao">
      <button className="btn" disabled={pagina <= 1} onClick={() => onMudar(pagina - 1)}>
        ← Anterior
      </button>
      <span>
        {pagina} de {paginas}
      </span>
      <button className="btn" disabled={pagina >= paginas} onClick={() => onMudar(pagina + 1)}>
        Próxima →
      </button>
    </div>
  );
}
