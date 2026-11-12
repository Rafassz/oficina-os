import { NavLink, Outlet } from 'react-router-dom'
import { IPapel } from '../../../../../application/models'
import { useAuthService } from '../../../../../use-cases/auth'
import { useAppSelector } from '../../../../hooks/store-hooks'

const PAPEL: Record<IPapel, string> = { admin: 'Administrador', atendente: 'Atendimento', mecanico: 'Mecânico' }

export const DashboardLayout = () => {
  const usuario = useAppSelector((state) => state.auth.usuario)
  const { sair } = useAuthService()

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
            <button className="link" onClick={sair}>
              Sair
            </button>
          </div>
        )}
      </aside>

      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
