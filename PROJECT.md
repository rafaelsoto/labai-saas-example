# FeedbackFlow — Plano Completo do Projeto

> **SaaS de coleta de feedback**: empresas instalam um widget no site, visitantes deixam nota (1–5) + mensagem, e a empresa acompanha tudo num dashboard com gráficos e filtros.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Como as 4 Partes se Comunicam](#2-como-as-4-partes-se-comunicam)
3. [Banco de Dados — Schema Completo](#3-banco-de-dados--schema-completo)
4. [API — Todas as Rotas](#4-api--todas-as-rotas)
5. [Estrutura de Pastas](#5-estrutura-de-pastas)
6. [Widget — Detalhes Técnicos](#6-widget--detalhes-técnicos)
7. [Autenticação e Segurança](#7-autenticação-e-segurança)
8. [Ordem de Implementação](#8-ordem-de-implementação)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                 │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
 ┌───────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────┐
 │  Landing  │ │ Dashboard  │ │   API     │ │   Widget     │
 │  Page     │ │  (Next.js) │ │ (Express) │ │  (JS puro)   │
 │ (Next.js) │ │  :3001     │ │  :3333    │ │  embed.js    │
 │  :3000    │ │            │ │           │ │              │
 └───────────┘ └─────┬──────┘ └─────┬─────┘ └──────┬───────┘
                     │              │               │
                     │    ┌─────────┴─────────┐     │
                     └───►│   REST API (:3333) │◄────┘
                          └─────────┬─────────┘
                                    │
                              ┌─────▼─────┐
                              │ PostgreSQL │
                              │   :5432    │
                              └───────────┘
```

| Parte          | Tech       | Porta | Descrição                                         |
| -------------- | ---------- | ----- | ------------------------------------------------- |
| **API**        | Express.js | 3333  | Backend central — toda lógica de negócio           |
| **Dashboard**  | Next.js    | 3001  | Painel da empresa — gráficos, filtros, config      |
| **Landing**    | Next.js    | 3000  | Página de marketing — pricing, features, signup    |
| **Widget**     | JS puro    | —     | Script leve que o cliente cola no site dele         |

---

## 2. Como as 4 Partes se Comunicam

### 2.1 Landing Page → API

- **Signup/Login**: A landing page tem formulários que fazem `POST` para a API (`/api/auth/register`, `/api/auth/login`).
- Após login bem-sucedido, redireciona o usuário para o Dashboard com o JWT no cookie `httpOnly`.

### 2.2 Dashboard → API

- **Todas as operações** do dashboard passam pela API via chamadas `fetch` autenticadas.
- O JWT é enviado como `Bearer token` no header `Authorization`.
- O Dashboard **nunca** acessa o banco direto — sempre via API.

### 2.3 Widget → API

- O widget carrega via `<script src="https://api.feedbackflow.com/widget/embed.js">`.
- Ao enviar feedback, faz `POST /api/widget/feedbacks` com a `apiKey` do projeto no body.
- Usa **CORS** configurado para aceitar qualquer origem (o widget roda em sites de terceiros).
- **Não precisa de JWT** — a autenticação do widget é feita pela `apiKey` do projeto.

### 2.4 Landing Page ↔ Dashboard

- Não se comunicam diretamente.
- A Landing redireciona para o Dashboard após login.
- Compartilham a mesma API como backend.

### Diagrama de Comunicação

```
Landing Page                    Dashboard
     │                              │
     │  POST /auth/register         │  GET /projects
     │  POST /auth/login            │  GET /feedbacks?projectId=x
     │─────────────────►┌───────┐◄──│  POST /projects
     │                  │  API  │   │  PUT /projects/:id
     │                  │       │   │  GET /analytics/overview
     │                  └───┬───┘   │
     │                      │       │
     │                      │       │
Widget ──POST /widget/feedbacks──►  │
  (apiKey no body)          │       │
                      ┌─────▼─────┐ │
                      │ PostgreSQL│ │
                      └───────────┘ │
```

---

## 3. Banco de Dados — Schema Completo

### 3.1 Tabela `users`

Armazena os usuários que gerenciam os projetos (donos das empresas).

```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500),
    plan          VARCHAR(50)  NOT NULL DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

| Coluna          | Tipo          | Descrição                            |
| --------------- | ------------- | ------------------------------------ |
| `id`            | UUID          | Identificador único                  |
| `name`          | VARCHAR(255)  | Nome completo                        |
| `email`         | VARCHAR(255)  | Email (único, usado no login)        |
| `password_hash` | VARCHAR(255)  | Senha com bcrypt                     |
| `avatar_url`    | VARCHAR(500)  | URL do avatar (opcional)             |
| `plan`          | VARCHAR(50)   | Plano atual do usuário               |
| `created_at`    | TIMESTAMPTZ   | Data de criação                      |
| `updated_at`    | TIMESTAMPTZ   | Última atualização                   |

---

### 3.2 Tabela `projects`

Cada projeto é um site/app onde o widget será instalado.

```sql
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    url         VARCHAR(500),              -- URL do site (opcional, informativo)
    api_key     VARCHAR(64) NOT NULL UNIQUE,
    is_active   BOOLEAN DEFAULT TRUE,
    settings    JSONB DEFAULT '{
        "widget_color": "#6366f1",
        "widget_position": "bottom-right",
        "widget_language": "pt-BR",
        "prompt_text": "Como foi sua experiência?",
        "thank_you_text": "Obrigado pelo seu feedback!"
    }'::jsonb,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_api_key ON projects(api_key);
```

| Coluna       | Tipo          | Descrição                                     |
| ------------ | ------------- | --------------------------------------------- |
| `id`         | UUID          | Identificador único                           |
| `user_id`    | UUID (FK)     | Dono do projeto                               |
| `name`       | VARCHAR(255)  | Nome do projeto (ex: "Meu E-commerce")        |
| `url`        | VARCHAR(500)  | URL do site do cliente                         |
| `api_key`    | VARCHAR(64)   | Chave única para autenticar o widget           |
| `is_active`  | BOOLEAN       | Se o widget está ativo                         |
| `settings`   | JSONB         | Configurações visuais/textos do widget         |
| `created_at` | TIMESTAMPTZ   | Data de criação                                |
| `updated_at` | TIMESTAMPTZ   | Última atualização                             |

**Detalhes do campo `settings` (JSONB):**

```json
{
    "widget_color": "#6366f1",
    "widget_position": "bottom-right",   // "bottom-right" | "bottom-left" | "top-right" | "top-left"
    "widget_language": "pt-BR",          // "pt-BR" | "en" | "es"
    "prompt_text": "Como foi sua experiência?",
    "thank_you_text": "Obrigado pelo seu feedback!"
}
```

---

### 3.3 Tabela `feedbacks`

Cada feedback enviado por um visitante.

```sql
CREATE TABLE feedbacks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message     TEXT,
    page_url    VARCHAR(1000),             -- URL da página onde o feedback foi dado
    user_agent  VARCHAR(500),              -- Browser do visitante
    ip_address  INET,                      -- IP do visitante (para anti-spam)
    metadata    JSONB DEFAULT '{}'::jsonb,  -- Dados extras (idioma do browser, resolução, etc.)
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_project_id ON feedbacks(project_id);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX idx_feedbacks_rating ON feedbacks(rating);
CREATE INDEX idx_feedbacks_project_created ON feedbacks(project_id, created_at DESC);
```

| Coluna       | Tipo           | Descrição                                  |
| ------------ | -------------- | ------------------------------------------ |
| `id`         | UUID           | Identificador único                        |
| `project_id` | UUID (FK)      | Projeto ao qual pertence                   |
| `rating`     | SMALLINT (1–5) | Nota de 1 a 5                              |
| `message`    | TEXT           | Mensagem do visitante (opcional)            |
| `page_url`   | VARCHAR(1000)  | Página onde o feedback foi enviado          |
| `user_agent` | VARCHAR(500)   | User-Agent do navegador                    |
| `ip_address` | INET           | IP do visitante                            |
| `metadata`   | JSONB          | Dados extras do contexto                   |
| `is_read`    | BOOLEAN        | Se o dono do projeto já leu                |
| `created_at` | TIMESTAMPTZ    | Data de envio                              |

---

### 3.4 Tabela `api_keys_log`

Registro de uso das API keys (auditoria e rate limiting).

```sql
CREATE TABLE api_keys_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    api_key     VARCHAR(64) NOT NULL,
    action      VARCHAR(50) NOT NULL,       -- 'feedback_created', 'widget_loaded'
    ip_address  INET,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_log_project_id ON api_keys_log(project_id);
CREATE INDEX idx_api_keys_log_created_at ON api_keys_log(created_at);
```

---

### 3.5 Tabela `password_reset_tokens`

Tokens temporários para recuperação de senha.

```sql
CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
```

---

### 3.6 Diagrama ER

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users     │       │   projects   │       │    feedbacks      │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │◄──┐   │ id (PK)          │
│ name         │   └───│ user_id (FK) │   └───│ project_id (FK)  │
│ email        │       │ name         │       │ rating           │
│ password_hash│       │ url          │       │ message          │
│ avatar_url   │       │ api_key      │       │ page_url         │
│ plan         │       │ is_active    │       │ user_agent       │
│ created_at   │       │ settings     │       │ ip_address       │
│ updated_at   │       │ created_at   │       │ metadata         │
└──────────────┘       │ updated_at   │       │ is_read          │
       │               └──────────────┘       │ created_at       │
       │                      │               └──────────────────┘
       ▼                      ▼
┌──────────────────┐  ┌───────────────┐
│ password_reset_  │  │ api_keys_log  │
│    tokens        │  ├───────────────┤
├──────────────────┤  │ id (PK)       │
│ id (PK)          │  │ project_id(FK)│
│ user_id (FK)     │  │ api_key       │
│ token            │  │ action        │
│ expires_at       │  │ ip_address    │
│ used             │  │ created_at    │
│ created_at       │  └───────────────┘
└──────────────────┘
```

**Relacionamentos:**
- `users` 1 → N `projects` (um usuário tem vários projetos)
- `projects` 1 → N `feedbacks` (um projeto recebe vários feedbacks)
- `projects` 1 → N `api_keys_log` (auditoria de uso)
- `users` 1 → N `password_reset_tokens`

---

## 4. API — Todas as Rotas

> Base URL: `http://localhost:3333/api`

### 4.1 Autenticação (`/api/auth`)

| Método | Rota                         | Auth?  | Descrição                              | Body / Params                                                  | Resposta                                    |
| ------ | ---------------------------- | ------ | -------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| POST   | `/auth/register`             | ❌     | Cadastro de novo usuário               | `{ name, email, password }`                                    | `{ user, token }`                           |
| POST   | `/auth/login`                | ❌     | Login                                  | `{ email, password }`                                          | `{ user, token }`                           |
| POST   | `/auth/forgot-password`      | ❌     | Envia email de recuperação             | `{ email }`                                                    | `{ message }`                               |
| POST   | `/auth/reset-password`       | ❌     | Reseta a senha com token               | `{ token, newPassword }`                                       | `{ message }`                               |
| GET    | `/auth/me`                   | ✅ JWT | Retorna dados do usuário logado        | —                                                              | `{ user }`                                  |
| PUT    | `/auth/me`                   | ✅ JWT | Atualiza perfil do usuário             | `{ name?, avatar_url? }`                                       | `{ user }`                                  |
| PUT    | `/auth/change-password`      | ✅ JWT | Troca a senha                          | `{ currentPassword, newPassword }`                             | `{ message }`                               |

---

### 4.2 Projetos (`/api/projects`)

| Método | Rota                             | Auth?  | Descrição                              | Body / Params                                                  | Resposta                                    |
| ------ | -------------------------------- | ------ | -------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| GET    | `/projects`                      | ✅ JWT | Lista projetos do usuário              | Query: `?page=1&limit=10`                                      | `{ projects[], total, page }`               |
| POST   | `/projects`                      | ✅ JWT | Cria um novo projeto                   | `{ name, url? }`                                               | `{ project }`                               |
| GET    | `/projects/:id`                  | ✅ JWT | Detalhes de um projeto                 | —                                                              | `{ project }`                               |
| PUT    | `/projects/:id`                  | ✅ JWT | Atualiza projeto                       | `{ name?, url?, is_active?, settings? }`                       | `{ project }`                               |
| DELETE | `/projects/:id`                  | ✅ JWT | Deleta projeto e todos os feedbacks    | —                                                              | `{ message }`                               |
| POST   | `/projects/:id/regenerate-key`   | ✅ JWT | Gera nova API key                      | —                                                              | `{ api_key }`                               |

---

### 4.3 Feedbacks (`/api/feedbacks`)

| Método | Rota                              | Auth?  | Descrição                                    | Body / Params                                                                     | Resposta                                     |
| ------ | --------------------------------- | ------ | -------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| GET    | `/feedbacks`                      | ✅ JWT | Lista feedbacks dos projetos do usuário       | Query: `?projectId=x&rating=5&startDate=x&endDate=x&page=1&limit=20&search=texto` | `{ feedbacks[], total, page }`               |
| GET    | `/feedbacks/:id`                  | ✅ JWT | Detalhes de um feedback                       | —                                                                                 | `{ feedback }`                               |
| PATCH  | `/feedbacks/:id/read`             | ✅ JWT | Marca feedback como lido                      | —                                                                                 | `{ feedback }`                               |
| PATCH  | `/feedbacks/read-all`             | ✅ JWT | Marca todos os feedbacks de um projeto lidos  | `{ projectId }`                                                                   | `{ message, count }`                         |
| DELETE | `/feedbacks/:id`                  | ✅ JWT | Deleta um feedback                            | —                                                                                 | `{ message }`                                |

---

### 4.4 Analytics (`/api/analytics`)

| Método | Rota                              | Auth?  | Descrição                                  | Params                                            | Resposta                                                    |
| ------ | --------------------------------- | ------ | ------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/analytics/overview`             | ✅ JWT | Resumo geral (todos projetos)              | Query: `?period=7d\|30d\|90d`                      | `{ totalFeedbacks, avgRating, totalProjects, trend }`       |
| GET    | `/analytics/project/:projectId`   | ✅ JWT | Métricas de um projeto                     | Query: `?period=7d\|30d\|90d`                      | `{ totalFeedbacks, avgRating, ratingDistribution, trend }`  |
| GET    | `/analytics/ratings-over-time`    | ✅ JWT | Notas ao longo do tempo                    | Query: `?projectId=x&period=7d\|30d\|90d&group=day\|week` | `{ data: [{ date, avgRating, count }] }`             |
| GET    | `/analytics/feedbacks-per-day`    | ✅ JWT | Feedbacks por dia                          | Query: `?projectId=x&period=30d`                   | `{ data: [{ date, count }] }`                              |
| GET    | `/analytics/top-pages`            | ✅ JWT | Páginas com mais feedbacks                 | Query: `?projectId=x&limit=10`                     | `{ pages: [{ url, count, avgRating }] }`                   |

---

### 4.5 Widget — Rotas Públicas (`/api/widget`)

> Essas rotas NÃO precisam de JWT. São autenticadas pela API Key do projeto.

| Método | Rota                              | Auth?      | Descrição                              | Body / Params                                             | Resposta                                    |
| ------ | --------------------------------- | ---------- | -------------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| GET    | `/widget/config`                  | ✅ API Key | Retorna config visual do widget        | Query: `?apiKey=xxx`                                       | `{ settings, project_name }`               |
| POST   | `/widget/feedbacks`               | ✅ API Key | Recebe feedback do visitante           | `{ apiKey, rating, message?, page_url?, metadata? }`       | `{ success, feedback_id }`                 |
| GET    | `/widget/embed.js`                | ❌         | Serve o script do widget               | —                                                          | JavaScript file                             |

---

### 4.6 Health Check

| Método | Rota                | Auth? | Descrição                | Resposta                    |
| ------ | ------------------- | ----- | -------------------------| --------------------------- |
| GET    | `/health`           | ❌    | Status da API            | `{ status: "ok", uptime }` |

---

## 5. Estrutura de Pastas

### 5.1 Raiz do Monorepo

```
feedbackflow/
├── apps/
│   ├── api/                 # Backend Express
│   ├── dashboard/           # Dashboard Next.js
│   ├── landing/             # Landing Page Next.js
│   └── widget/              # Widget JS
├── packages/
│   └── shared/              # Tipos e utilitários compartilhados
├── docker-compose.yml       # PostgreSQL + serviços (dev)
├── .env.example
├── .gitignore
├── package.json             # Workspaces config
├── PROJECT.md               # Este arquivo
└── README.md
```

---

### 5.2 API (`apps/api`)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── database.js          # Conexão com PostgreSQL (pg / knex)
│   │   ├── env.js               # Validação de variáveis de ambiente
│   │   └── cors.js              # Configuração CORS
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifica JWT
│   │   ├── apiKeyMiddleware.js  # Verifica API Key do widget
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── errorHandler.js      # Handler global de erros
│   │   └── validate.js          # Validação de body/params (Zod)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   ├── projects/
│   │   │   ├── projects.routes.js
│   │   │   ├── projects.controller.js
│   │   │   ├── projects.service.js
│   │   │   └── projects.validation.js
│   │   ├── feedbacks/
│   │   │   ├── feedbacks.routes.js
│   │   │   ├── feedbacks.controller.js
│   │   │   ├── feedbacks.service.js
│   │   │   └── feedbacks.validation.js
│   │   ├── analytics/
│   │   │   ├── analytics.routes.js
│   │   │   ├── analytics.controller.js
│   │   │   └── analytics.service.js
│   │   └── widget/
│   │       ├── widget.routes.js
│   │       ├── widget.controller.js
│   │       └── widget.service.js
│   ├── utils/
│   │   ├── generateApiKey.js    # Gerador de API keys seguras
│   │   ├── hashPassword.js      # Bcrypt helpers
│   │   └── jwtHelpers.js        # sign, verify token
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_create_users.js
│   │   │   ├── 002_create_projects.js
│   │   │   ├── 003_create_feedbacks.js
│   │   │   ├── 004_create_api_keys_log.js
│   │   │   └── 005_create_password_reset_tokens.js
│   │   └── seeds/
│   │       └── dev_seed.js       # Dados de teste
│   ├── app.js                    # Setup do Express (middlewares, rotas)
│   └── server.js                 # Entrypoint (listen na porta)
├── .env.example
├── knexfile.js                   # Config do Knex (query builder)
├── package.json
└── nodemon.json
```

---

### 5.3 Dashboard (`apps/dashboard`)

```
apps/dashboard/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js                   # Redirect para /dashboard
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.js
│   │   │   ├── register/
│   │   │   │   └── page.js
│   │   │   ├── forgot-password/
│   │   │   │   └── page.js
│   │   │   └── reset-password/
│   │   │       └── page.js
│   │   └── (dashboard)/
│   │       ├── layout.js             # Sidebar + topbar
│   │       ├── dashboard/
│   │       │   └── page.js           # Overview com gráficos
│   │       ├── projects/
│   │       │   ├── page.js           # Lista de projetos
│   │       │   ├── new/
│   │       │   │   └── page.js       # Criar projeto
│   │       │   └── [id]/
│   │       │       ├── page.js       # Feedbacks do projeto
│   │       │       └── settings/
│   │       │           └── page.js   # Config do projeto/widget
│   │       ├── analytics/
│   │       │   └── page.js           # Gráficos detalhados
│   │       └── settings/
│   │           └── page.js           # Config da conta
│   ├── components/
│   │   ├── ui/                        # Componentes base reutilizáveis
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── MobileNav.jsx
│   │   ├── charts/
│   │   │   ├── RatingChart.jsx       # Gráfico de notas ao longo do tempo
│   │   │   ├── FeedbacksPerDay.jsx   # Barras de feedbacks por dia
│   │   │   ├── RatingDistribution.jsx # Distribuição de notas (donut)
│   │   │   └── TopPages.jsx          # Ranking de páginas
│   │   ├── feedback/
│   │   │   ├── FeedbackList.jsx
│   │   │   ├── FeedbackCard.jsx
│   │   │   └── FeedbackFilters.jsx
│   │   ├── project/
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ApiKeyDisplay.jsx
│   │   │   └── WidgetPreview.jsx
│   │   └── common/
│   │       ├── EmptyState.jsx
│   │       ├── LoadingSpinner.jsx
│   │       └── ErrorBoundary.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProjects.js
│   │   ├── useFeedbacks.js
│   │   └── useAnalytics.js
│   ├── lib/
│   │   ├── api.js                     # Axios/fetch configurado com token
│   │   ├── auth.js                    # Helpers de autenticação
│   │   └── utils.js                   # Formatadores, helpers gerais
│   ├── contexts/
│   │   └── AuthContext.jsx            # Context de autenticação
│   └── styles/
│       └── globals.css
├── next.config.js
├── package.json
└── jsconfig.json
```

---

### 5.4 Landing Page (`apps/landing`)

```
apps/landing/
├── public/
│   ├── favicon.ico
│   └── images/
│       ├── hero-illustration.svg
│       ├── dashboard-preview.png
│       └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js                    # Home (hero + features + pricing)
│   │   ├── pricing/
│   │   │   └── page.js
│   │   └── terms/
│   │       └── page.js
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── Features.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Pricing.jsx
│   │   ├── Testimonials.jsx
│   │   ├── CTA.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── styles/
│       └── globals.css
├── next.config.js
└── package.json
```

---

### 5.5 Widget (`apps/widget`)

```
apps/widget/
├── src/
│   ├── index.js                # Entrypoint do widget
│   ├── widget.js               # Lógica principal (montar UI, enviar feedback)
│   ├── api.js                  # Chamadas à API
│   ├── styles.js               # CSS-in-JS (injetado no DOM)
│   └── utils.js                # Helpers (rating stars, validação)
├── dist/
│   └── embed.js                # Bundle final (minificado, < 15KB)
├── webpack.config.js           # Config do bundler
├── package.json
└── README.md
```

---

### 5.6 Shared (`packages/shared`)

```
packages/shared/
├── src/
│   ├── constants.js            # Constantes compartilhadas (planos, limites)
│   ├── validators.js           # Schemas de validação Zod compartilhados
│   └── types.js                # JSDoc typedefs / definições de tipos
├── package.json
└── index.js
```

---

## 6. Widget — Detalhes Técnicos

### 6.1 Como o Cliente Instala

O dono do projeto recebe um snippet para colar antes do `</body>`:

```html
<!-- FeedbackFlow Widget -->
<script
  src="https://api.feedbackflow.com/widget/embed.js"
  data-api-key="ff_proj_a1b2c3d4e5f6..."
  data-position="bottom-right"
  data-color="#6366f1"
  async
></script>
```

### 6.2 O Que o `embed.js` Faz

1. **Lê os atributos `data-*`** do próprio `<script>` para pegar a apiKey + overrides.
2. **Faz `GET /api/widget/config?apiKey=xxx`** para buscar as configurações do projeto (cor, posição, textos).
3. **Injeta HTML + CSS** no DOM:
   - Um botão flutuante (FAB) no canto configurado
   - Um popup/modal com:
     - Texto de prompt ("Como foi sua experiência?")
     - 5 estrelas clicáveis
     - Campo de texto para mensagem
     - Botão "Enviar"
4. **Ao enviar**, faz `POST /api/widget/feedbacks` com `{ apiKey, rating, message, page_url }`.
5. **Mostra mensagem de agradecimento** e fecha o popup.

### 6.3 Requisitos do Widget

- **Tamanho do bundle**: < 15KB gzipped
- **Zero dependências**: Vanilla JS puro
- **Isolamento**: Todo CSS com escopo (shadow DOM ou prefixo único)
- **Sem conflito**: Não polui o escopo global (IIFE)
- **Responsivo**: Funciona em desktop e mobile

---

## 7. Autenticação e Segurança

### 7.1 JWT (Dashboard + Landing)

```
Fluxo:
1. Usuário faz login → API retorna JWT
2. Frontend armazena o JWT (httpOnly cookie ou localStorage)
3. Toda request ao backend envia: Authorization: Bearer <token>
4. Middleware valida o token e injeta req.userId
```

**Estrutura do JWT (payload):**

```json
{
  "userId": "uuid-do-usuario",
  "email": "user@email.com",
  "plan": "free",
  "iat": 1700000000,
  "exp": 1700086400    // 24 horas
}
```

### 7.2 API Key (Widget)

```
Fluxo:
1. Dono cria projeto → API gera api_key única (ex: ff_proj_a1b2c3d4e5...)
2. Dono cola o snippet com a api_key no site
3. Widget envia api_key em toda request
4. Middleware busca o projeto pela api_key e valida se está ativo
```

**Formato da API Key:**

```
ff_proj_<32 caracteres hex aleatórios>
Exemplo: ff_proj_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
```

### 7.3 Segurança Geral

| Medida                 | Onde                | Detalhes                                 |
| ---------------------- | ------------------- | ---------------------------------------- |
| Rate limiting          | API (global)        | 100 req/min por IP                       |
| Rate limiting          | Widget endpoints    | 10 feedbacks/min por IP                  |
| CORS                   | API                 | Dashboard/Landing: origem específica. Widget: `*` |
| Helmet                 | API                 | Headers de segurança                     |
| Input sanitization     | API                 | Zod + sanitize nos inputs de texto       |
| Password hashing       | API                 | bcrypt com salt rounds = 12              |
| SQL Injection          | API                 | Knex query builder (parametrizado)       |
| XSS no widget          | Widget              | Escape de todo conteúdo HTML             |

---

## 8. Ordem de Implementação

> Do mais independente para o mais dependente. Cada fase pode ser **totalmente testada** antes de avançar.

### Fase 1 — Infraestrutura Base

**Objetivo:** Setup do monorepo + banco + primeira rota.

```
1.1 [SETUP]     Inicializar monorepo com npm workspaces
1.2 [SETUP]     docker-compose.yml com PostgreSQL
1.3 [API]       Setup Express básico (app.js, server.js, env.js)
1.4 [API]       Configurar Knex + conexão com PostgreSQL
1.5 [API]       Criar migrations (todas as tabelas)
1.6 [API]       Rodar migrations e validar schema
1.7 [API]       GET /health funcionando
```

**Depende de:** Nada.
**Teste:** `curl http://localhost:3333/api/health` retorna `{ status: "ok" }`.

---

### Fase 2 — Autenticação

**Objetivo:** Registro, login, JWT completos.

```
2.1 [API]       Middlewares: errorHandler, validate (Zod)
2.2 [API]       Utils: hashPassword, jwtHelpers, generateApiKey
2.3 [API]       Módulo auth: routes, controller, service, validation
2.4 [API]       Middleware authMiddleware (verifica JWT)
2.5 [API]       Rotas: register, login, me, change-password
2.6 [API]       Rotas: forgot-password, reset-password
```

**Depende de:** Fase 1.
**Teste:** Registrar → Login → Acessar `/auth/me` com token → Retorna dados do usuário.

---

### Fase 3 — Projetos (CRUD)

**Objetivo:** Criar, listar, editar, deletar projetos. Gerar API key.

```
3.1 [API]       Módulo projects: routes, controller, service, validation
3.2 [API]       CRUD completo com paginação
3.3 [API]       Rota de regenerar API key
3.4 [API]       Validação de ownership (user só acessa seus projetos)
```

**Depende de:** Fase 2 (precisa de auth para saber o `userId`).
**Teste:** Criar projeto → Listar → Verificar que a api_key foi gerada → Regenerar key.

---

### Fase 4 — Widget (Receber Feedback)

**Objetivo:** Endpoint público para receber feedbacks + script embed.

```
4.1 [API]       Middleware apiKeyMiddleware
4.2 [API]       Módulo widget: routes, controller, service
4.3 [API]       POST /widget/feedbacks (recebe feedback)
4.4 [API]       GET /widget/config (retorna settings do projeto)
4.5 [API]       Rate limiting específico para widget endpoints
4.6 [WIDGET]    Setup Webpack para buildar embed.js
4.7 [WIDGET]    Implementar widget: UI (FAB + popup + estrelas)
4.8 [WIDGET]    Implementar widget: lógica de envio
4.9 [WIDGET]    Implementar widget: carregar config da API
4.10 [WIDGET]   Testar widget num HTML de exemplo
4.11 [API]      GET /widget/embed.js (servir o script estático)
```

**Depende de:** Fase 3 (precisa de projetos com api_key).
**Teste:** Abrir HTML de teste → Widget aparece → Enviar feedback → Verificar no banco.

---

### Fase 5 — Feedbacks (Dashboard API)

**Objetivo:** Listar, filtrar, marcar como lido, deletar feedbacks.

```
5.1 [API]       Módulo feedbacks: routes, controller, service, validation
5.2 [API]       GET /feedbacks com filtros (projeto, rating, data, busca)
5.3 [API]       Paginação
5.4 [API]       PATCH /feedbacks/:id/read + read-all
5.5 [API]       DELETE /feedbacks/:id
```

**Depende de:** Fase 4 (precisa de feedbacks no banco para listar).
**Teste:** Enviar feedbacks pelo widget → Listar pela API com filtros → Marcar lido.

---

### Fase 6 — Analytics

**Objetivo:** Endpoints de métricas e agregações.

```
6.1 [API]       Módulo analytics: routes, controller, service
6.2 [API]       GET /analytics/overview (resumo geral)
6.3 [API]       GET /analytics/project/:id (métricas por projeto)
6.4 [API]       GET /analytics/ratings-over-time (série temporal)
6.5 [API]       GET /analytics/feedbacks-per-day
6.6 [API]       GET /analytics/top-pages
```

**Depende de:** Fase 5 (precisa de feedbacks para calcular métricas).
**Teste:** Verificar que os números batem com os feedbacks do banco.

---

### Fase 7 — Dashboard Frontend

**Objetivo:** Interface completa do painel de controle.

```
7.1  [DASH]     Setup Next.js com App Router
7.2  [DASH]     Design system: componentes UI base (Button, Input, Card, etc.)
7.3  [DASH]     Layout: Sidebar + Topbar
7.4  [DASH]     Auth context + hook useAuth
7.5  [DASH]     Páginas de auth: login, registro, forgot/reset password
7.6  [DASH]     Lib api.js (fetch configurado com token)
7.7  [DASH]     Página de overview (dashboard principal com gráficos)
7.8  [DASH]     Página de projetos (listagem + criar)
7.9  [DASH]     Página de detalhes do projeto (feedbacks + filtros)
7.10 [DASH]     Página de settings do projeto (widget config + preview)
7.11 [DASH]     Página de analytics (gráficos detalhados)
7.12 [DASH]     Página de configurações da conta
7.13 [DASH]     Componentes de gráficos (Recharts ou Chart.js)
7.14 [DASH]     Responsividade + dark mode
```

**Depende de:** Fase 6 (toda a API precisa estar pronta).
**Teste:** Fluxo completo — login → criar projeto → ver feedbacks → ver gráficos.

---

### Fase 8 — Landing Page

**Objetivo:** Página de marketing para vender o produto.

```
8.1 [LAND]     Setup Next.js
8.2 [LAND]     Hero section com CTA
8.3 [LAND]     Seção de features
8.4 [LAND]     Seção "Como funciona" (3 passos)
8.5 [LAND]     Seção de pricing (Free / Pro / Enterprise)
8.6 [LAND]     Testimonials
8.7 [LAND]     Footer
8.8 [LAND]     SEO meta tags
8.9 [LAND]     Formulário de signup que chama a API
8.10 [LAND]    Animações e responsividade
```

**Depende de:** Fase 2 (só precisa dos endpoints de auth para signup/login).
**Mas pode ser desenvolvida em paralelo com as Fases 3–7** (o conteúdo é estático).

---

### Fase 9 — Polish & Deploy

**Objetivo:** Tudo bonito, testado e pronto para produção.

```
9.1 [ALL]       Variáveis de ambiente para produção
9.2 [API]       Seed de dados de demonstração
9.3 [ALL]       Testes end-to-end básicos
9.4 [ALL]       README com instruções de setup
9.5 [ALL]       Dockerfiles para cada serviço
9.6 [ALL]       CI/CD pipeline (GitHub Actions)
```

**Depende de:** Todas as fases anteriores.

---

### Resumo Visual da Ordem

```
Fase 1 ─► Fase 2 ─► Fase 3 ─► Fase 4 ─► Fase 5 ─► Fase 6 ─► Fase 7 ─► Fase 9
                                                                  │
                         Fase 8 (paralela, só precisa Fase 2) ────┘
```

---

## Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://feedbackflow:secret@localhost:5432/feedbackflow
DB_HOST=localhost
DB_PORT=5432
DB_NAME=feedbackflow
DB_USER=feedbackflow
DB_PASSWORD=secret

# JWT
JWT_SECRET=sua-chave-super-secreta-aqui
JWT_EXPIRES_IN=24h

# API
API_PORT=3333
API_URL=http://localhost:3333

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3333/api
DASHBOARD_PORT=3001

# Landing
NEXT_PUBLIC_API_URL=http://localhost:3333/api
LANDING_PORT=3000

# Widget
WIDGET_API_URL=http://localhost:3333/api

# Email (para recuperação de senha)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=seu-user
SMTP_PASS=sua-senha
EMAIL_FROM=noreply@feedbackflow.com
```

---

## Tech Stack Completa

| Categoria       | Tecnologia                         |
| --------------- | ---------------------------------- |
| Runtime          | Node.js 20+                       |
| Backend          | Express.js                        |
| Frontend         | Next.js 14+ (App Router)         |
| Banco de Dados   | PostgreSQL 16                     |
| Query Builder    | Knex.js                          |
| Autenticação     | JWT (jsonwebtoken)               |
| Hash de Senha    | bcryptjs                         |
| Validação        | Zod                              |
| Gráficos         | Recharts                         |
| HTTP Client      | Axios (Dashboard/Landing)        |
| Widget Bundler   | Webpack 5                        |
| Rate Limiting    | express-rate-limit               |
| Segurança        | helmet, cors                     |
| Dev              | nodemon, concurrently            |
| Monorepo         | npm workspaces                   |
| Containerização  | Docker + docker-compose          |
