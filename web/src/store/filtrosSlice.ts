import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Guarda o filtro da lista de OS pra não perder ao abrir uma OS e voltar.
export type FiltroStatus =
  | 'abertas'
  | 'atrasadas'
  | 'orcamento'
  | 'aprovada,em_execucao'
  | 'aguardando_peca'
  | 'pronta'
  | 'entregue'
  | '';

interface FiltrosState {
  status: FiltroStatus;
  busca: string;
  pagina: number;
}

const initialState: FiltrosState = { status: 'abertas', busca: '', pagina: 1 };

const filtrosSlice = createSlice({
  name: 'filtrosOrdens',
  initialState,
  reducers: {
    mudouStatus(state, action: PayloadAction<FiltroStatus>) {
      state.status = action.payload;
      state.pagina = 1;
    },
    mudouBusca(state, action: PayloadAction<string>) {
      state.busca = action.payload;
      state.pagina = 1;
    },
    mudouPagina(state, action: PayloadAction<number>) {
      state.pagina = action.payload;
    },
  },
});

export const { mudouStatus, mudouBusca, mudouPagina } = filtrosSlice.actions;
export default filtrosSlice.reducer;
