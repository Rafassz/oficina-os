import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IUsuario } from '../../models'

interface IUsuariosState {
  mecanicos: IUsuario[]
}

const initialState: IUsuariosState = { mecanicos: [] }

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    setMecanicosState(state, action: PayloadAction<IUsuario[]>) {
      state.mecanicos = action.payload
    },
  },
})

export const { setMecanicosState } = usuariosSlice.actions
export const usuariosReducer = usuariosSlice.reducer
