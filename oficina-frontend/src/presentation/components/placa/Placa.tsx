import { placa as formatarPlaca } from '../../../utils/formatters'

// Desenhada parecida com a placa física: ajuda o olho a achar o carro na lista
export const Placa = ({ valor, grande }: { valor: string; grande?: boolean }) => (
  <span className={`placa${grande ? ' placa-grande' : ''}`}>{formatarPlaca(valor)}</span>
)
