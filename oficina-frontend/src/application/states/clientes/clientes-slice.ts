import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ICliente, IClienteDetalhe, IPagina } from '../../models'

interface IClientesState {
  lista: IPagina<ICliente> | null
  carregandoLista: boolean
  filtros: {
    busca: string
    pagina: number
  }
  clienteAtual: IClienteDetalhe | null
}

export const clientesInitialState: IClientesState = {
  lista: null,
  carregandoLista: false,
  filtros: { busca: '', pagina: 1 },
  clienteAtual: null,
}

const clientesSlice = createSlice({
  name: 'clientes',
  initialState: clientesInitialState,
  reducers: {
    setClientesListaState(state, action: PayloadAction<IPagina<ICliente>>) {
      state.lista = action.payload
      state.carregandoLista = false
    },
    setClientesCarregandoState(state, action: PayloadAction<boolean>) {
      state.carregandoLista = action.payload
    },
    setClientesBuscaState(state, action: PayloadAction<string>) {
      state.filtros.busca = action.payload
      state.filtros.pagina = 1
    },
    setClientesPaginaState(state, action: PayloadAction<number>) {
      state.filtros.pagina = action.payload
    },
    setClienteAtualState(state, action: PayloadAction<IClienteDetalhe | null>) {
      state.clienteAtual = action.payload
    },
  },
})

export const {
  setClientesListaState,
  setClientesCarregandoState,
  setClientesBuscaState,
  setClientesPaginaState,
  setClienteAtualState,
} = clientesSlice.actions
export const clientesReducer = clientesSlice.reducer
