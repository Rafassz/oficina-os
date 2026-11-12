import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/store-hooks'
import { IProps } from './types/IProps'

export const PrivateRoute = ({ children }: IProps) => {
  const token = useAppSelector((state) => state.auth.token)
  const local = useLocation()

  if (!token) return <Navigate to="/login" replace state={{ de: local.pathname }} />
  return children
}
