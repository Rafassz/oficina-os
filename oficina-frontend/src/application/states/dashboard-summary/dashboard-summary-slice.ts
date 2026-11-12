import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IDashboardSummary } from '../../models'

interface IDashboardSummaryState {
  resumo: IDashboardSummary | null
}

const initialState: IDashboardSummaryState = { resumo: null }

const dashboardSummarySlice = createSlice({
  name: 'dashboardSummary',
  initialState,
  reducers: {
    setDashboardSummaryState(state, action: PayloadAction<IDashboardSummary>) {
      state.resumo = action.payload
    },
  },
})

export const { setDashboardSummaryState } = dashboardSummarySlice.actions
export const dashboardSummaryReducer = dashboardSummarySlice.reducer
