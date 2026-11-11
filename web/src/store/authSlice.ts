import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Usuario } from '../types';

const CHAVE = 'oficina.sessao';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
}

function lerSessaoSalva(): AuthState {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo) as AuthState;
  } catch {
    // localStorage indisponível ou corrompido: começa deslogado
  }
  return { token: null, usuario: null };
}

export function salvarSessao(estado: AuthState) {
  try {
    if (estado.token) localStorage.setItem(CHAVE, JSON.stringify(estado));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: lerSessaoSalva,
  reducers: {
    entrou(state, action: PayloadAction<{ token: string; usuario: Usuario }>) {
      state.token = action.payload.token;
      state.usuario = action.payload.usuario;
    },
    sair(state) {
      state.token = null;
      state.usuario = null;
    },
  },
});

export const { entrou, sair } = authSlice.actions;
export default authSlice.reducer;
