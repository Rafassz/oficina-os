import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../pages/auth-section'
import {
  DashboardHome,
  DashboardLayout,
  DetalheCliente,
  DetalheOrdem,
  FormNovaOrdem,
  ListaClientes,
  ListaOrdens,
} from '../../pages/private-section/dashboard'
import { PrivateRoute } from '../private-route'

export const MainRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<DashboardHome />} />
      <Route path="ordens" element={<ListaOrdens />} />
      <Route path="ordens/nova" element={<FormNovaOrdem />} />
      <Route path="ordens/:IdOrdemServico" element={<DetalheOrdem />} />
      <Route path="clientes" element={<ListaClientes />} />
      <Route path="clientes/:IdCliente" element={<DetalheCliente />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
