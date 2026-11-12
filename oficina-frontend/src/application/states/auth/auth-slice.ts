import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISessao, IUsuario } from '../../models'

interface IAuthState {
  token: string | null
  usuario: IUsuario | null
}

export const authInitialState: IAuthState = { token: null, usuario: null }

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setSessaoState(state, action: PayloadAction<ISessao>) {
      state.token = action.payload.token
      state.usuario = action.payload.usuario
    },
    resetSessaoState(state) {
      state.token = null
      state.usuario = null
    },
  },
})

export const { setSessaoState, resetSessaoState } = authSlice.actions
export const authReducer = authSlice.reducer
