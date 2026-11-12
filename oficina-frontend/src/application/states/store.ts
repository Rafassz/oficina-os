import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { lerSessaoSalva } from '../../use-cases/local-storage'
import { authInitialState, authReducer } from './auth'
import { clientesReducer } from './clientes'
import { dashboardSummaryReducer } from './dashboard-summary'
import { ordensReducer } from './ordens'
import { uiReducer } from './ui'
import { usuariosReducer } from './usuarios'

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  ordens: ordensReducer,
  clientes: clientesReducer,
  dashboardSummary: dashboardSummaryReducer,
  usuarios: usuariosReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const criarStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState })

// a sessão salva volta ao recarregar a página
export const store = criarStore({ auth: lerSessaoSalva() ?? authInitialState })

export type AppStore = ReturnType<typeof criarStore>
export type AppDispatch = AppStore['dispatch']
