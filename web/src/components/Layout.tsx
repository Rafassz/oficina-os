import { NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { sair } from '../store/authSlice';

const PAPEL: Record<string, string> = { admin: 'Administrador', atendente: 'Atendimento', mecanico: 'Mecânico' };

export default function Layout() {
  const usuario = useAppSelector((s) => s.auth.usuario);
  const dispatch = useAppDispatch();

  return (
    <div className="casca">
      <aside className="lateral">
        <div className="marca">
          <strong>Oficina Prado</strong>
          <span>mecânica &amp; elétrica</span>
        </div>

        <nav>
          <NavLink to="/" end>
            Painel
          </NavLink>
          <NavLink to="/ordens">Ordens de serviço</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
        </nav>

        <NavLink to="/ordens/nova" className="btn btn-destaque nova-os">
          + Abrir OS
        </NavLink>

        {usuario && (
          <div className="sessao">
            <div>
              <strong>{usuario.nome}</strong>
              <span>{PAPEL[usuario.papel]}</span>
            </div>
            <button className="link" onClick={() => dispatch(sair())}>
              Sair
            </button>
          </div>
        )}
      </aside>

      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
