import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IAlerta {
  tipo: 'erro' | 'ok'
  mensagem: string
}

interface IUIState {
  alerta: IAlerta | null
}

const initialState: IUIState = { alerta: null }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setAlertaState(state, action: PayloadAction<IAlerta>) {
      state.alerta = action.payload
    },
    resetAlertaState(state) {
      state.alerta = null
    },
  },
})

export const { setAlertaState, resetAlertaState } = uiSlice.actions
export const uiReducer = uiSlice.reducer
