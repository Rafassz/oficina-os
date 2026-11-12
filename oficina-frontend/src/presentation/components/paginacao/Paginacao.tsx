interface IProps {
  pagina: number
  total: number
  porPagina: number
  onMudar: (pagina: number) => void
}

export const Paginacao = ({ pagina, total, porPagina, onMudar }: IProps) => {
  const paginas = Math.ceil(total / porPagina)
  if (paginas <= 1) return null
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
  )
}
