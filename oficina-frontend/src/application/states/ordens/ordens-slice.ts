import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IFiltroStatusOS, IOrdemServico, IPagina } from '../../models'

interface IOrdensState {
  lista: IPagina<IOrdemServico> | null
  carregandoLista: boolean
  // filtro fica guardado para não se perder ao abrir uma OS e voltar
  filtros: {
    status: IFiltroStatusOS
    busca: string
    pagina: number
  }
  ordemAtual: IOrdemServico | null
}

export const ordensInitialState: IOrdensState = {
  lista: null,
  carregandoLista: false,
  filtros: { status: 'abertas', busca: '', pagina: 1 },
  ordemAtual: null,
}

const ordensSlice = createSlice({
  name: 'ordens',
  initialState: ordensInitialState,
  reducers: {
    setOrdensListaState(state, action: PayloadAction<IPagina<IOrdemServico>>) {
      state.lista = action.payload
      state.carregandoLista = false
    },
    setOrdensCarregandoState(state, action: PayloadAction<boolean>) {
      state.carregandoLista = action.payload
    },
    setOrdensFiltroStatusState(state, action: PayloadAction<IFiltroStatusOS>) {
      state.filtros.status = action.payload
      state.filtros.pagina = 1
    },
    setOrdensFiltroBuscaState(state, action: PayloadAction<string>) {
      state.filtros.busca = action.payload
      state.filtros.pagina = 1
    },
    setOrdensPaginaState(state, action: PayloadAction<number>) {
      state.filtros.pagina = action.payload
    },
    setOrdemAtualState(state, action: PayloadAction<IOrdemServico | null>) {
      state.ordemAtual = action.payload
    },
  },
})

export const {
  setOrdensListaState,
  setOrdensCarregandoState,
  setOrdensFiltroStatusState,
  setOrdensFiltroBuscaState,
  setOrdensPaginaState,
  setOrdemAtualState,
} = ordensSlice.actions
export const ordensReducer = ordensSlice.reducer
