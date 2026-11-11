import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAppSelector } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Painel from './pages/Painel';
import Ordens from './pages/Ordens';
import NovaOrdem from './pages/NovaOrdem';
import OrdemDetalhe from './pages/OrdemDetalhe';
import Clientes from './pages/Clientes';
import ClienteDetalhe from './pages/ClienteDetalhe';

function Protegido({ children }: { children: JSX.Element }) {
  const token = useAppSelector((s) => s.auth.token);
  const local = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protegido>
            <Layout />
          </Protegido>
        }
      >
        <Route index element={<Painel />} />
        <Route path="ordens" element={<Ordens />} />
        <Route path="ordens/nova" element={<NovaOrdem />} />
        <Route path="ordens/:id" element={<OrdemDetalhe />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalhe />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
