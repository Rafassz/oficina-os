import { IStatusOS } from '../../../application/models'
import { ROTULO_STATUS } from '../../assets/helpers'

export const StatusTag = ({ status }: { status: IStatusOS }) => (
  <span className={`tag tag-${status}`}>{ROTULO_STATUS[status]}</span>
)
