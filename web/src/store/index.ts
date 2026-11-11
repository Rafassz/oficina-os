import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer, { salvarSessao } from './authSlice';
import filtrosReducer from './filtrosSlice';
import { api } from './api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filtrosOrdens: filtrosReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

// Persiste a sessão fora do reducer (reducer não deve ter efeito colateral)
let ultimaSessao = store.getState().auth;
store.subscribe(() => {
  const atual = store.getState().auth;
  if (atual !== ultimaSessao) {
    ultimaSessao = atual;
    salvarSessao(atual);
    if (!atual.token) store.dispatch(api.util.resetApiState());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
