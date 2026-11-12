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
- Regras da oficina aplicadas no backend:
  - um veículo não pode ter duas OS abertas ao mesmo tempo;
  - KM de entrada não pode ser menor que o último registrado;
  - só aprova orçamento com pelo menos um item;
  - desconto não pode passar do valor da OS;
  - depois de "pronta", os valores ficam travados; OS entregue/cancelada não muda mais;
  - cliente com OS registrada não pode ser excluído;
  - o responsável pela OS precisa ser um mecânico ativo;
  - só administrador cadastra usuários.
- **Clientes e veículos** (placa antiga `ABC1234` e Mercosul `ABC1D23`), com
  histórico de serviços e total já gasto.
- **Painel** com carros na oficina, OS atrasadas, prontas para retirada e
  faturamento do mês.
- Busca única por número da OS, placa ou nome do cliente.
- Impressão da OS com campo de assinatura e aviso de "carro pronto" pelo WhatsApp.
- Login com JWT e papéis (administrador, atendimento, mecânico).

## Tecnologias

| Camada    | Tecnologia                                                         |
|-----------|--------------------------------------------------------------------|
| Front-end | React 18, TypeScript, Redux Toolkit, React Router, Axios, Vite     |
| Back-end  | Node.js, Express 5, TypeScript, JWT, bcrypt                        |
| Banco     | MongoDB com Mongoose                                               |
| Testes    | Jest + ts-jest (backend), Vitest + Testing Library (frontend)      |

Valores monetários são guardados em **centavos (inteiro)** para evitar erro de
arredondamento com ponto flutuante.

## Arquitetura

### Backend (`oficina-backend/`)

Cada módulo de negócio fica em `src/application/<modulo>` e cada operação é um
caso de uso isolado:

```
src/
├── index.ts                         # sobe o Express e registra as rotas
├── application/
│   ├── authentication/  usuario/  cliente/  veiculo/  ordem-servico/  dashboard/
│   │   ├── models/                  # interfaces do domínio (ICliente, IOrdemServico...)
│   │   ├── repositories/
│   │   │   ├── interfaces/          # contrato: o que o caso de uso pode pedir ao banco
│   │   │   └── implementations/     # MongoXRepository + schemas do Mongoose
│   │   ├── routes/                  # só liga URL -> setupController().handle
│   │   └── use-cases/
│   │       ├── shared/              # regras usadas por mais de um caso de uso
│   │       └── <caso-de-uso>/
│   │           ├── Controller.ts    # lê a requisição, chama o UseCase, devolve HTTP
│   │           ├── UseCase.ts       # REGRAS DE NEGÓCIO
│   │           ├── DTO/             # IRequest / IResponse
│   │           ├── setupController.ts  # monta as dependências (injeção)
│   │           └── tests/           # UseCase.spec.ts e Controller.spec.ts
└── utils/
    ├── result/                      # Result<T, E> + erros tipados
    ├── middlewares/                 # jwtMiddleware e JwtAuthMiddleware
    ├── controller/                  # IController e tradução erro -> status HTTP
    ├── logger-decorator/            # @LogThis nos UseCases
    ├── database/ env/ env-validator/ formatters/ validations/ token/ general/
database/seed.ts                     # dados de exemplo
```

**Regra da arquitetura:** rota não tem lógica, controller não tem regra,
repositório não decide nada. Toda regra de negócio está em `UseCase.ts` (ou em
`use-cases/shared` quando é usada por mais de um caso de uso). Os casos de uso
recebem os repositórios pela interface, então os testes trocam o banco por
mocks.

Cada UseCase devolve um `Result`: sucesso com o valor, ou falha com um erro
tipado (`RequiredFieldError`, `InvalidFieldError`, `NotFoundError`,
`NotAcceptableError`, `UniqueKeyDuplicateError`, `WrongCredentials`,
`DataBaseError`, `UnknownError`). O controller só traduz o tipo do erro para o
status HTTP (400, 400, 404, 406, 409, 401, 500, 500).

### Frontend (`oficina-frontend/`)

```
src/
├── index.tsx
├── application/
│   ├── models/                      # interfaces (espelham as respostas da API)
│   └── states/                      # Redux: store + um slice por assunto
├── infra/                           # use<X>Api: chamadas HTTP com axios
├── use-cases/                       # use<X>Service: junta API + Redux para as telas
├── presentation/
│   ├── pages/                       # auth-section / private-section/dashboard/...
│   ├── components/                  # StatusTag, Placa, Paginacao, AlertContainer...
│   ├── router/                      # MainRouter e PrivateRoute
│   ├── hooks/                       # useAppDispatch / useAppSelector
│   ├── assets/helpers/              # rótulos de status
│   └── styles/
└── utils/formatters/                # moeda, data, placa, telefone, documento
```

As páginas só falam com os **services** (`use-cases`), que chamam a **infra** e
gravam o resultado nos **slices** do Redux.

## Rotas da API

| Método | Rota                              | Caso de uso                     |
|--------|-----------------------------------|---------------------------------|
| POST   | `/api/auth/login`                 | `authentication/login`          |
| GET    | `/api/auth/me`                    | `authentication/get-me`         |
| GET    | `/api/usuarios?papel=`            | `usuario/get-all-usuarios`      |
| POST   | `/api/usuarios`                   | `usuario/create`                |
| GET    | `/api/clientes?busca=&pagina=`    | `cliente/get-all-clientes`      |
| GET    | `/api/clientes/:IdCliente`        | `cliente/get-cliente-detalhe`   |
| POST   | `/api/clientes`                   | `cliente/create`                |
| PUT    | `/api/clientes/:IdCliente`        | `cliente/update`                |
| DELETE | `/api/clientes/:IdCliente`        | `cliente/delete`                |
| GET    | `/api/veiculos?placa=`            | `veiculo/get-by-placa`          |
| POST   | `/api/veiculos`                   | `veiculo/create`                |
| PUT    | `/api/veiculos/:IdVeiculo`        | `veiculo/update`                |
| GET    | `/api/ordens?status=&busca=`      | `ordem-servico/get-all-ordens`  |
| GET    | `/api/ordens/:IdOrdemServico`     | `ordem-servico/get-by-id`       |
| POST   | `/api/ordens`                     | `ordem-servico/create`          |
| PUT    | `/api/ordens/:IdOrdemServico`     | `ordem-servico/update`          |
| POST   | `/api/ordens/:IdOrdemServico/status` | `ordem-servico/mudar-status` |
| GET    | `/api/painel`                     | `dashboard/get-summary`         |

## Como rodar

Pré-requisitos: **Node.js 20+** e **MongoDB** rodando em `localhost:27017`
(MongoDB Community Server ou uma string do MongoDB Atlas).

```bash
npm install
```

```bash
cp oficina-backend/.env.example oficina-backend/.env
```

Edite o `.env`: defina um `JWT_SECRET` e, se precisar, o `MONGO_URI`.

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

### Testes

```bash
npm test
```

Roda os testes do backend (Jest: casos de uso e controllers) e do frontend
(Vitest: services e formatadores).

### Build de produção

```bash
npm run build
```
