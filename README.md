# Oficina Prado — controle de ordens de serviço

Sistema web para uma oficina mecânica de bairro controlar a entrada de veículos,
orçamentos, execução dos serviços e entrega ao cliente. Substitui o caderno /
bloco de OS em papel que a oficina usava.

Projeto Integrador — Programação WEB (UNISA).

## O que o sistema faz

- **Ordens de serviço** com numeração sequencial, relato do cliente, diagnóstico,
  peças e mão de obra, desconto e previsão de entrega.
- **Fluxo de status controlado pela API**:
  `orçamento → aprovada → em execução ⇄ aguardando peça → pronta → entregue`
  (cancelamento possível até a execução, com motivo obrigatório).
  Transições fora desse fluxo são recusadas.
- Regras da oficina aplicadas no servidor:
  - um veículo não pode ter duas OS abertas ao mesmo tempo;
  - KM de entrada não pode ser menor que o último registrado;
  - só aprova orçamento com pelo menos um item;
  - depois de "pronta", os valores ficam travados.
- **Clientes e veículos** (placa antiga `ABC1234` e Mercosul `ABC1D23`), com
  histórico de serviços e total já gasto.
- **Painel** com carros na oficina, OS atrasadas, prontas para retirada e
  faturamento do mês (calculado por agregação no MongoDB).
- Busca única por número da OS, placa ou nome do cliente.
- Impressão da OS com campo de assinatura e aviso de "carro pronto" pelo WhatsApp.
- Login com JWT e papéis (administrador, atendimento, mecânico).

## Tecnologias

| Camada    | Tecnologia                                                    |
|-----------|---------------------------------------------------------------|
| Front-end | React 18, TypeScript, Redux Toolkit (slices + RTK Query), React Router, Vite |
| Back-end  | Node.js, Express 5, TypeScript, Zod (validação), JWT, bcrypt   |
| Banco     | MongoDB com Mongoose                                          |

Valores monetários são guardados em **centavos (inteiro)** para evitar erro de
arredondamento com ponto flutuante.

## Estrutura

```
oficina/
├── api/                 # servidor Express
│   └── src/
│       ├── config/      # variáveis de ambiente
│       ├── domain/      # regras do fluxo de status da OS
│       ├── middlewares/ # autenticação e tratamento de erros
│       ├── models/      # schemas do Mongoose
│       ├── routes/      # rotas REST
│       ├── utils/
│       ├── app.ts
│       ├── server.ts
│       └── seed.ts      # dados de exemplo
└── web/                 # front-end React
    └── src/
        ├── store/       # Redux: authSlice, filtrosSlice e api (RTK Query)
        ├── pages/
        ├── components/
        └── lib/         # formatação (moeda, placa, telefone...)
```

### Como o Redux é usado

- `authSlice` — token e usuário logado (persistido no `localStorage` via
  `store.subscribe`, fora do reducer).
- `filtrosSlice` — aba e busca da lista de OS, para não perder o filtro ao abrir
  uma OS e voltar.
- `api` (RTK Query) — todas as chamadas HTTP, com cache e invalidação por tags
  (ex.: mudar o status de uma OS atualiza a lista, o painel e a ficha do cliente).

## Rotas da API

| Método | Rota                       | Descrição                               |
|--------|----------------------------|-----------------------------------------|
| POST   | `/api/auth/login`          | Login, devolve o token                  |
| GET    | `/api/auth/me`             | Usuário logado                          |
| GET    | `/api/painel`              | Indicadores do painel                   |
| GET    | `/api/ordens`              | Lista (`status`, `busca`, `pagina`)     |
| POST   | `/api/ordens`              | Abre OS                                 |
| GET    | `/api/ordens/:id`          | Detalhe + próximos status permitidos    |
| PUT    | `/api/ordens/:id`          | Edita diagnóstico, itens, prazo...      |
| POST   | `/api/ordens/:id/status`   | Muda status                             |
| GET    | `/api/clientes`            | Lista / busca                           |
| GET    | `/api/clientes/:id`        | Cliente + veículos + histórico          |
| POST   | `/api/clientes`            | Cadastra                                |
| PUT    | `/api/clientes/:id`        | Edita                                   |
| DELETE | `/api/clientes/:id`        | Exclui (só sem OS registradas)          |
| GET    | `/api/veiculos?placa=`     | Busca por placa                         |
| POST   | `/api/veiculos`            | Cadastra veículo                        |
| GET    | `/api/usuarios`            | Lista usuários (`?papel=mecanico`)      |
| POST   | `/api/usuarios`            | Cria usuário (só admin)                 |

## Como rodar

Pré-requisitos: **Node.js 20+** e **MongoDB** rodando em `localhost:27017`
(MongoDB Community Server ou uma string do MongoDB Atlas).

```bash
npm install
```

```bash
cp api/.env.example api/.env
```

(edite `MONGO_URI` e `JWT_SECRET` se precisar)

```bash
npm run seed
```

```bash
npm run dev
```

Acesse http://localhost:5173

Usuário de demonstração criado pelo seed: `admin@oficina.local` / `oficina123`
(também existem `carlos@oficina.local` e `rogerio@oficina.local`, mecânicos,
com a mesma senha).

Para apagar tudo e recriar os dados de exemplo: `npm run seed -- --limpar`.

### Build de produção

```bash
npm run build
```

A API compila para `api/dist` (`npm start -w api`) e o front para `web/dist`.
