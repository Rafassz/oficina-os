import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import { entrou, sair } from './authSlice';
import type { Cliente, ItemOS, OrdemServico, Pagina, Painel, StatusOS, Usuario, Veiculo } from '../types';

const baseQueryCru = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Se o token expirar no meio do expediente, desloga e volta pra tela de login.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const resultado = await baseQueryCru(args, api, extra);
  const url = typeof args === 'string' ? args : args.url;
  if (resultado.error?.status === 401 && url !== '/auth/login') {
    api.dispatch(sair());
  }
  return resultado;
};

export interface DetalheCliente {
  cliente: Cliente;
  veiculos: Veiculo[];
  ordens: (Pick<OrdemServico, '_id' | 'numero' | 'status' | 'createdAt' | 'entregueEm' | 'total'> & {
    veiculo: Pick<Veiculo, '_id' | 'placa' | 'modelo'>;
  })[];
}

export type EdicaoOS = Partial<Pick<OrdemServico, 'relato' | 'diagnostico' | 'desconto'>> & {
  itens?: ItemOS[];
  previsaoEntrega?: string | null;
  mecanico?: string | null;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Ordem', 'Cliente', 'Painel'],
  endpoints: (b) => ({
    login: b.mutation<{ token: string; usuario: Usuario }, { email: string; senha: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(entrou(data));
        } catch {
          // erro já aparece no formulário via o próprio hook
        }
      },
    }),

    painel: b.query<Painel, void>({
      query: () => '/painel',
      providesTags: ['Painel'],
    }),

    usuarios: b.query<Usuario[], { papel?: string } | void>({
      query: (params) => ({ url: '/usuarios', params: params ?? undefined }),
    }),

    // ---- ordens de serviço
    ordens: b.query<Pagina<OrdemServico>, { status?: string; busca?: string; pagina?: number }>({
      query: (params) => ({ url: '/ordens', params }),
      providesTags: (res) => [
        { type: 'Ordem', id: 'LISTA' },
        ...(res?.itens.map((o) => ({ type: 'Ordem' as const, id: o._id })) ?? []),
      ],
    }),
    ordem: b.query<OrdemServico, string>({
      query: (id) => `/ordens/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Ordem', id }],
    }),
    abrirOrdem: b.mutation<
      OrdemServico,
      { cliente: string; veiculo: string; relato: string; kmEntrada?: number; previsaoEntrega?: string; mecanico?: string }
    >({
      query: (body) => ({ url: '/ordens', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Ordem', id: 'LISTA' },
        { type: 'Cliente', id: arg.cliente },
        'Painel',
      ],
    }),
    editarOrdem: b.mutation<OrdemServico, { id: string } & EdicaoOS>({
      query: ({ id, ...body }) => ({ url: `/ordens/${id}`, method: 'PUT', body }),
      // atualiza o cache direto com a resposta, sem refazer o GET
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(api.util.upsertQueryData('ordem', id, data));
        } catch {
          /* tratado na tela */
        }
      },
      invalidatesTags: [{ type: 'Ordem', id: 'LISTA' }, 'Painel'],
    }),
    mudarStatus: b.mutation<OrdemServico, { id: string; status: StatusOS; obs?: string }>({
      query: ({ id, ...body }) => ({ url: `/ordens/${id}/status`, method: 'POST', body }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(api.util.upsertQueryData('ordem', id, data));
        } catch {
          /* tratado na tela */
        }
      },
      invalidatesTags: (r) => [{ type: 'Ordem', id: 'LISTA' }, 'Painel', { type: 'Cliente', id: r?.cliente._id }],
    }),

    // ---- clientes e veículos
    clientes: b.query<Pagina<Cliente>, { busca?: string; pagina?: number }>({
      query: (params) => ({ url: '/clientes', params }),
      providesTags: [{ type: 'Cliente', id: 'LISTA' }],
    }),
    cliente: b.query<DetalheCliente, string>({
      query: (id) => `/clientes/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Cliente', id }],
    }),
    salvarCliente: b.mutation<Cliente, Partial<Cliente>>({
      query: ({ _id, ...body }) =>
        _id ? { url: `/clientes/${_id}`, method: 'PUT', body } : { url: '/clientes', method: 'POST', body },
      invalidatesTags: (r) => [
        { type: 'Cliente', id: 'LISTA' },
        { type: 'Cliente', id: r?._id },
      ],
    }),
    excluirCliente: b.mutation<void, string>({
      query: (id) => ({ url: `/clientes/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cliente', id: 'LISTA' }],
    }),
    cadastrarVeiculo: b.mutation<Veiculo, Omit<Veiculo, '_id'>>({
      query: (body) => ({ url: '/veiculos', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'Cliente', id: arg.cliente }],
    }),
  }),
});

export const {
  useLoginMutation,
  usePainelQuery,
  useUsuariosQuery,
  useOrdensQuery,
  useOrdemQuery,
  useAbrirOrdemMutation,
  useEditarOrdemMutation,
  useMudarStatusMutation,
  useClientesQuery,
  useClienteQuery,
  useSalvarClienteMutation,
  useExcluirClienteMutation,
  useCadastrarVeiculoMutation,
} = api;

// Extrai a mensagem que a API mandou ({ erro, campos }) de qualquer erro do RTK Query.
export function mensagemDeErro(erro: unknown): string | null {
  if (!erro) return null;
  if (typeof erro === 'object' && 'data' in erro) {
    const data = (erro as { data?: { erro?: string; campos?: Record<string, string> } }).data;
    if (data?.campos) {
      return Object.values(data.campos).join(' · ');
    }
    if (data?.erro) return data.erro;
  }
  if (typeof erro === 'object' && 'status' in erro && (erro as { status: unknown }).status === 'FETCH_ERROR') {
    return 'Sem conexão com o servidor';
  }
  return 'Algo deu errado. Tente novamente.';
}
