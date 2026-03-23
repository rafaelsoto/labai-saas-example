# FeedbackFlow — Tarefas Executáveis

> Cada tarefa é **autossuficiente** — um agente consegue executar sozinho sem depender de outro rodando ao mesmo tempo. As dependências indicam apenas a **ordem**: a tarefa anterior precisa estar **concluída** antes de iniciar a próxima.

---

## Mapa de Dependências

```
TASK-01 ──► TASK-02 ──► TASK-03 ──► TASK-04 (API widget)
                                        │
                                        ├──► TASK-05 ──► TASK-06
                                        │
                                        └──► TASK-07 (segurança — pode ser junto com TASK-05)

TASK-08 (pode iniciar após TASK-02)
   └──► TASK-09 ──► TASK-10 ──► TASK-11 ──► TASK-12 ──► TASK-13

TASK-04 concluída ──► TASK-14 (widget JS)
```

---

## 🔵 SERVIDOR E API

---

### TASK-01 — Setup do Monorepo e Infraestrutura Base

**Depende de:** Nada
**Módulo:** Infraestrutura
**Resultado esperado:** Monorepo funcional com Express rodando e PostgreSQL conectado.

**O que fazer:**

1. Criar o monorepo na raiz do projeto com npm workspaces:
   - `package.json` raiz com `workspaces: ["apps/*", "packages/*"]`
   - Criar diretórios: `apps/api`, `apps/dashboard`, `apps/landing`, `apps/widget`, `packages/shared`

2. Configurar `docker-compose.yml` na raiz:
   - Serviço PostgreSQL 16 na porta 5432
   - Banco: `feedbackflow`, user: `feedbackflow`, senha: `secret`
   - Volume persistente para dados

3. Criar `apps/api` com Express:
   - `package.json` com dependências: `express`, `knex`, `pg`, `dotenv`, `cors`, `helmet`
   - `src/config/env.js` — carrega e valida variáveis de ambiente
   - `src/config/database.js` — conexão Knex com PostgreSQL
   - `src/config/cors.js` — config CORS
   - `src/app.js` — setup Express com middlewares básicos (json, cors, helmet)
   - `src/server.js` — entrypoint com `app.listen(3333)`
   - `knexfile.js` na raiz do app
   - `nodemon.json` para dev
   - `.env.example` com todas as variáveis

4. Criar `packages/shared`:
   - `package.json` com nome `@feedbackflow/shared`
   - `src/constants.js` — planos (free/pro/enterprise), limites por plano
   - `src/types.js` — JSDoc typedefs para User, Project, Feedback
   - `index.js` — re-exporta tudo

5. Criar `.gitignore` e `.env.example` na raiz

6. Implementar rota `GET /api/health` que retorna `{ status: "ok", uptime, timestamp }`

**Arquivos criados:**
```
├── package.json
├── docker-compose.yml
├── .gitignore
├── .env.example
├── apps/api/
│   ├── package.json
│   ├── knexfile.js
│   ├── nodemon.json
│   ├── .env.example
│   └── src/
│       ├── config/database.js
│       ├── config/env.js
│       ├── config/cors.js
│       ├── app.js
│       └── server.js
└── packages/shared/
    ├── package.json
    ├── index.js
    └── src/
        ├── constants.js
        └── types.js
```

**Validação:** Subir Docker, rodar `npm run dev` no api, `curl localhost:3333/api/health` retorna OK.

---

### TASK-02 — Banco de Dados: Migrations e Seeds

**Depende de:** TASK-01
**Módulo:** API / Banco de Dados
**Resultado esperado:** Todas as tabelas criadas no PostgreSQL com índices e seed de dev.

**O que fazer:**

1. Criar migrations Knex em `apps/api/src/database/migrations/`:

   - `001_create_users.js`:
     ```
     id (UUID PK), name (VARCHAR 255), email (VARCHAR 255 UNIQUE),
     password_hash (VARCHAR 255), avatar_url (VARCHAR 500 nullable),
     plan (VARCHAR 50 default 'free'), created_at, updated_at
     Índice: idx_users_email em email
     ```

   - `002_create_projects.js`:
     ```
     id (UUID PK), user_id (UUID FK → users ON DELETE CASCADE),
     name (VARCHAR 255), url (VARCHAR 500 nullable),
     api_key (VARCHAR 64 UNIQUE), is_active (BOOLEAN default true),
     settings (JSONB com defaults: widget_color, widget_position, widget_language,
     prompt_text, thank_you_text), created_at, updated_at
     Índices: idx_projects_user_id, idx_projects_api_key
     ```

   - `003_create_feedbacks.js`:
     ```
     id (UUID PK), project_id (UUID FK → projects ON DELETE CASCADE),
     rating (SMALLINT CHECK 1-5), message (TEXT nullable),
     page_url (VARCHAR 1000), user_agent (VARCHAR 500),
     ip_address (INET), metadata (JSONB default {}),
     is_read (BOOLEAN default false), created_at
     Índices: project_id, created_at, rating, (project_id + created_at DESC)
     ```

   - `004_create_api_keys_log.js`:
     ```
     id (UUID PK), project_id (UUID FK → projects ON DELETE CASCADE),
     api_key (VARCHAR 64), action (VARCHAR 50), ip_address (INET), created_at
     Índices: project_id, created_at
     ```

   - `005_create_password_reset_tokens.js`:
     ```
     id (UUID PK), user_id (UUID FK → users ON DELETE CASCADE),
     token (VARCHAR 255 UNIQUE), expires_at (TIMESTAMPTZ),
     used (BOOLEAN default false), created_at
     Índice: token
     ```

2. Criar `apps/api/src/database/seeds/dev_seed.js`:
   - 2 usuários de teste (com senha hasheada via bcrypt)
   - 3 projetos (com api_keys geradas)
   - 15–20 feedbacks variados (ratings 1–5, com e sem mensagem, datas diferentes dos últimos 30 dias)

3. Adicionar scripts no `package.json` da API:
   - `migrate`: `knex migrate:latest`
   - `migrate:rollback`: `knex migrate:rollback`
   - `seed`: `knex seed:run`

**Validação:** `npm run migrate` cria as tabelas, `npm run seed` popula dados, consulta SQL confirma dados.

---

### TASK-03 — Sistema de Autenticação (Auth)

**Depende de:** TASK-02
**Módulo:** API / Auth
**Resultado esperado:** Registro, login, JWT e gerenciamento de senha funcionando.

**O que fazer:**

1. Criar utilitários em `apps/api/src/utils/`:
   - `hashPassword.js` — `hashPassword(plain)` e `comparePassword(plain, hash)` usando bcrypt (salt 12)
   - `jwtHelpers.js` — `signToken(payload)` e `verifyToken(token)` usando jsonwebtoken
   - `generateApiKey.js` — gera string `ff_proj_<32 hex chars>` com crypto.randomBytes

2. Criar middlewares em `apps/api/src/middlewares/`:
   - `errorHandler.js` — middleware global de erro (captura exceções, retorna JSON padronizado)
   - `validate.js` — recebe schema Zod e valida `req.body` / `req.query` / `req.params`
   - `authMiddleware.js` — extrai Bearer token do header Authorization, verifica JWT, injeta `req.userId` e `req.userEmail`

3. Criar módulo `apps/api/src/modules/auth/`:
   - `auth.validation.js` — schemas Zod: registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema
   - `auth.service.js` — lógica de negócio:
     - `register(name, email, password)` → cria user, retorna user + token
     - `login(email, password)` → valida credenciais, retorna user + token
     - `getProfile(userId)` → retorna dados do user (sem password_hash)
     - `updateProfile(userId, data)` → atualiza name/avatar_url
     - `changePassword(userId, currentPassword, newPassword)`
     - `forgotPassword(email)` → gera token, salva em password_reset_tokens (expira em 1h)
     - `resetPassword(token, newPassword)` → valida token, atualiza senha
   - `auth.controller.js` — recebe req/res, chama service, retorna response
   - `auth.routes.js` — define as 7 rotas de auth

4. Registrar rotas de auth no `app.js`

**Rotas implementadas:**
| Método | Rota | Auth |
|--------|------|------|
| POST | `/api/auth/register` | ❌ |
| POST | `/api/auth/login` | ❌ |
| GET | `/api/auth/me` | ✅ JWT |
| PUT | `/api/auth/me` | ✅ JWT |
| PUT | `/api/auth/change-password` | ✅ JWT |
| POST | `/api/auth/forgot-password` | ❌ |
| POST | `/api/auth/reset-password` | ❌ |

**Dependências extras:** `bcryptjs`, `jsonwebtoken`, `zod`

**Validação:** Registrar usuário → logar → chamar GET /auth/me com token → receber dados do user.

---

### TASK-04 — CRUD de Projetos

**Depende de:** TASK-03
**Módulo:** API / Projetos
**Resultado esperado:** CRUD completo de projetos com geração de API key e validação de ownership.

**O que fazer:**

1. Criar módulo `apps/api/src/modules/projects/`:
   - `projects.validation.js` — schemas Zod: createProjectSchema, updateProjectSchema
   - `projects.service.js`:
     - `list(userId, page, limit)` → lista projetos do user com paginação + contagem de feedbacks por projeto
     - `getById(projectId, userId)` → detalhes do projeto (valida ownership)
     - `create(userId, data)` → cria projeto + gera api_key com `generateApiKey()`
     - `update(projectId, userId, data)` → atualiza campos (name, url, is_active, settings)
     - `delete(projectId, userId)` → deleta projeto (cascade deleta feedbacks)
     - `regenerateApiKey(projectId, userId)` → gera nova api_key, invalida anterior
   - `projects.controller.js` — recebe req/res, chama service
   - `projects.routes.js` — define rotas, todas com `authMiddleware`

2. **Validação de ownership**: toda operação verifica se `project.user_id === req.userId`. Retorna 403 se não for dono.

3. Registrar rotas no `app.js`

**Rotas implementadas:**
| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/projects` | ✅ JWT |
| POST | `/api/projects` | ✅ JWT |
| GET | `/api/projects/:id` | ✅ JWT |
| PUT | `/api/projects/:id` | ✅ JWT |
| DELETE | `/api/projects/:id` | ✅ JWT |
| POST | `/api/projects/:id/regenerate-key` | ✅ JWT |

**Validação:** Criar projeto → listar → verificar api_key → atualizar → regenerar key → deletar.

---

### TASK-05 — Feedbacks: Receber e Consultar

**Depende de:** TASK-04
**Módulo:** API / Feedbacks + Widget endpoints
**Resultado esperado:** Widget pode enviar feedbacks, dashboard pode listar/filtrar/gerenciar.

**O que fazer:**

1. Criar middleware `apps/api/src/middlewares/apiKeyMiddleware.js`:
   - Extrai `apiKey` do body ou query string
   - Busca projeto pelo api_key no banco
   - Valida se o projeto existe e está ativo (`is_active = true`)
   - Injeta `req.project` no request
   - Retorna 401 se key inválida, 403 se projeto inativo

2. Criar módulo `apps/api/src/modules/widget/`:
   - `widget.service.js`:
     - `getConfig(apiKey)` → retorna settings + project_name
     - `createFeedback(projectId, data)` → insere feedback no banco, captura ip/user_agent do request
   - `widget.controller.js` e `widget.routes.js`
   - Rota GET `/api/widget/embed.js` — serve arquivo estático (por enquanto retorna placeholder JS)

3. Criar módulo `apps/api/src/modules/feedbacks/`:
   - `feedbacks.validation.js` — schemas de filtro e paginação
   - `feedbacks.service.js`:
     - `list(userId, filters)` → lista feedbacks dos projetos do user com filtros: projectId, rating, startDate, endDate, search (busca na message), page, limit. Ordena por created_at DESC
     - `getById(feedbackId, userId)` → detalhes (valida ownership via project)
     - `markAsRead(feedbackId, userId)` → is_read = true
     - `markAllAsRead(projectId, userId)` → marca todos do projeto como lidos, retorna count
     - `delete(feedbackId, userId)` → deleta feedback
   - `feedbacks.controller.js` e `feedbacks.routes.js`

4. Registrar rotas no `app.js`

**Rotas implementadas:**
| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/widget/config` | ✅ API Key |
| POST | `/api/widget/feedbacks` | ✅ API Key |
| GET | `/api/widget/embed.js` | ❌ |
| GET | `/api/feedbacks` | ✅ JWT |
| GET | `/api/feedbacks/:id` | ✅ JWT |
| PATCH | `/api/feedbacks/:id/read` | ✅ JWT |
| PATCH | `/api/feedbacks/read-all` | ✅ JWT |
| DELETE | `/api/feedbacks/:id` | ✅ JWT |

**Validação:** Enviar feedback via POST com apiKey → listar via GET com JWT → marcar como lido → deletar.

---

### TASK-06 — Analytics

**Depende de:** TASK-05
**Módulo:** API / Analytics
**Resultado esperado:** Endpoints de métricas e agregações para o dashboard.

**O que fazer:**

1. Criar módulo `apps/api/src/modules/analytics/`:
   - `analytics.service.js`:
     - `getOverview(userId, period)` → totalFeedbacks, avgRating, totalProjects, trend (comparação com período anterior em %)
     - `getProjectMetrics(projectId, userId, period)` → totalFeedbacks, avgRating, ratingDistribution (array com count por rating 1-5), trend
     - `getRatingsOverTime(projectId, userId, period, group)` → série temporal: `[{ date, avgRating, count }]` agrupado por dia ou semana
     - `getFeedbacksPerDay(projectId, userId, period)` → `[{ date, count }]`
     - `getTopPages(projectId, userId, limit)` → `[{ url, count, avgRating }]` ordenado por count DESC
   - `analytics.controller.js` e `analytics.routes.js`
   - Todas as queries usam Knex com aggregations SQL (AVG, COUNT, GROUP BY, date_trunc)

2. **Lógica de period**: converte `7d`, `30d`, `90d` em `WHERE created_at >= NOW() - INTERVAL '...'`

3. **Lógica de trend**: calcula métrica do período atual vs período anterior e retorna variação percentual

4. Registrar rotas no `app.js`

**Rotas implementadas:**
| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/analytics/overview` | ✅ JWT |
| GET | `/api/analytics/project/:projectId` | ✅ JWT |
| GET | `/api/analytics/ratings-over-time` | ✅ JWT |
| GET | `/api/analytics/feedbacks-per-day` | ✅ JWT |
| GET | `/api/analytics/top-pages` | ✅ JWT |

**Validação:** Seed o banco com feedbacks variados → chamar cada endpoint → verificar que os números calculados batem.

---

### TASK-07 — Segurança e Proteções

**Depende de:** TASK-05
**Módulo:** API / Segurança
**Resultado esperado:** Rate limiting, CORS refinado, auditoria de API keys, proteções anti-spam.

**O que fazer:**

1. Instalar `express-rate-limit`

2. Criar `apps/api/src/middlewares/rateLimiter.js`:
   - `globalLimiter` — 100 req/min por IP (todas as rotas)
   - `authLimiter` — 10 req/min por IP (rotas de login/registro para evitar brute force)
   - `widgetLimiter` — 10 feedbacks/min por IP (rota POST /widget/feedbacks)

3. Aplicar rate limiters nas rotas corretas em `app.js`

4. Refinar `src/config/cors.js`:
   - Rotas autenticadas (dashboard/landing): aceitar apenas origens configuradas via env (`DASHBOARD_URL`, `LANDING_URL`)
   - Rotas de widget: aceitar qualquer origem (`*`)

5. Implementar log de auditoria no `widget.service.js`:
   - Ao criar feedback: inserir registro na tabela `api_keys_log` com action `feedback_created`
   - Ao carregar config: inserir com action `widget_loaded`

6. Adicionar sanitização de input nos textos de feedback:
   - Escapar HTML no campo `message` antes de salvar
   - Limitar tamanho de `message` a 2000 caracteres
   - Limitar tamanho de `page_url` a 1000 caracteres

7. Verificar que `helmet` está ativado no `app.js`

**Validação:** Fazer mais de 10 requests rápidas ao widget → receber 429. Testar CORS com origens diferentes. Verificar logs na tabela api_keys_log.

---

## 🟢 DASHBOARD (Next.js)

---

### TASK-08 — Setup do Projeto Next.js do Dashboard

**Depende de:** TASK-02 (precisa que a API de auth exista, ou seja, TASK-03 concluída é ideal, mas o setup do Next.js pode ser feito após TASK-02)
**Módulo:** Dashboard
**Resultado esperado:** Projeto Next.js funcional com design system base, layout e sistema de auth.

**O que fazer:**

1. Inicializar Next.js em `apps/dashboard/`:
   - `npx -y create-next-app@latest ./` com App Router, sem Tailwind, JavaScript
   - Limpar boilerplate

2. Criar design system em `src/styles/globals.css`:
   - CSS variables: cores (dark mode primeiro), tipografia (Google Font: Inter), espaçamentos, border-radius, shadows
   - Paleta: fundo escuro (#0a0a0f, #13131a), accent indigo (#6366f1), success/warning/error
   - Classes utilitárias base

3. Criar componentes UI base em `src/components/ui/`:
   - `Button.jsx` — variantes: primary, secondary, ghost, danger. Tamanhos: sm, md, lg
   - `Input.jsx` — com label, erro, ícone
   - `Card.jsx` — container com shadow e borda
   - `Badge.jsx` — status/rating badges coloridos
   - `Modal.jsx` — overlay + dialog
   - `Table.jsx` — tabela estilizada
   - `Select.jsx` — dropdown customizado
   - `Skeleton.jsx` — loading placeholder
   - `Tooltip.jsx` — tooltip on hover

4. Criar `src/lib/api.js`:
   - Wrapper de fetch configurado com base URL da API (`NEXT_PUBLIC_API_URL`)
   - Injeta automaticamente `Authorization: Bearer <token>` do localStorage
   - Intercepta 401 → redireciona para /login

5. Criar `src/contexts/AuthContext.jsx`:
   - State: user, token, loading
   - Functions: login, register, logout, updateProfile
   - Persiste token no localStorage
   - Carrega user no mount via GET /auth/me

6. Criar `src/hooks/useAuth.js` — consome o AuthContext

7. Criar `src/lib/auth.js` — helper de proteção de rotas (redireciona para /login se não autenticado)

8. Criar `src/lib/utils.js` — formatadores de data, números, rating para estrelas

**Validação:** `npm run dev` na porta 3001, app carrega sem erros, components renderizam.

---

### TASK-09 — Telas de Login e Registro

**Depende de:** TASK-08
**Módulo:** Dashboard / Auth pages
**Resultado esperado:** Telas de login, registro, esqueci senha e reset de senha funcionando.

**O que fazer:**

1. Criar layout de auth `src/app/(auth)/layout.js`:
   - Layout centralizado, card no meio da tela, fundo gradiente escuro, logo FeedbackFlow no topo

2. Criar `src/app/(auth)/login/page.js`:
   - Formulário: email + senha + botão "Entrar"
   - Link "Esqueci minha senha" e "Criar conta"
   - Chama `POST /api/auth/login` via AuthContext
   - Redirect para `/dashboard` após sucesso
   - Mostrar erros inline

3. Criar `src/app/(auth)/register/page.js`:
   - Formulário: nome + email + senha + confirmar senha
   - Validação client-side (senhas iguais, email válido, senha min 6 chars)
   - Chama `POST /api/auth/register`
   - Redirect para `/dashboard` após sucesso

4. Criar `src/app/(auth)/forgot-password/page.js`:
   - Formulário: email + botão "Enviar link"
   - Chama `POST /api/auth/forgot-password`
   - Mostra mensagem de sucesso

5. Criar `src/app/(auth)/reset-password/page.js`:
   - Lê token da query string
   - Formulário: nova senha + confirmar
   - Chama `POST /api/auth/reset-password`

**Design:** Telas premium com gradiente escuro, glassmorphism no card, animações suaves de entrada, ícone de olho para mostrar/ocultar senha.

**Validação:** Registrar → redireciona ao dashboard. Login com credenciais erradas → mostra erro. Fluxo de forgot password funciona.

---

### TASK-10 — Tela Principal (Dashboard Overview)

**Depende de:** TASK-09
**Módulo:** Dashboard / Overview
**Resultado esperado:** Dashboard principal com KPIs, gráficos e feedbacks recentes.

**O que fazer:**

1. Criar layout do dashboard `src/app/(dashboard)/layout.js`:
   - Sidebar fixa à esquerda com: logo, links (Dashboard, Projetos, Analytics, Configurações), botão logout
   - Topbar com: nome do usuário, avatar, notificação de feedbacks não lidos
   - Componentes: `src/components/layout/Sidebar.jsx`, `Topbar.jsx`, `MobileNav.jsx`
   - Sidebar colapsa em mobile → vira hamburger menu

2. Criar `src/hooks/useAnalytics.js` — hook que chama endpoints de analytics

3. Criar componentes de gráficos em `src/components/charts/` (usando Recharts):
   - `RatingChart.jsx` — line chart de nota média ao longo do tempo
   - `FeedbacksPerDay.jsx` — bar chart de feedbacks por dia
   - `RatingDistribution.jsx` — donut/pie chart com distribuição de notas 1-5
   - `TopPages.jsx` — horizontal bar chart ou ranking list

4. Criar `src/app/(dashboard)/dashboard/page.js`:
   - 4 KPI cards no topo: Total de Feedbacks, Nota Média, Total de Projetos, Trend (↑↓%)
   - Seletor de período (7d / 30d / 90d)
   - Grid com os 4 gráficos abaixo
   - Lista dos 5 feedbacks mais recentes
   - Loading skeletons enquanto carrega
   - Empty state se não houver dados

5. Instalar `recharts` como dependência

**Design:** Cards com glassmorphism, gráficos com gradientes suaves, cores consistentes com o design system, micro-animações nos KPIs (contagem animada).

**Validação:** Com seed data no banco, a página mostra KPIs corretos, gráficos renderizam, período altera os dados.

---

### TASK-11 — Tela de Feedbacks com Filtros

**Depende de:** TASK-10
**Módulo:** Dashboard / Feedbacks
**Resultado esperado:** Listagem de feedbacks com filtros, busca, paginação e ações.

**O que fazer:**

1. Criar `src/hooks/useFeedbacks.js` — hook com estado de filtros, paginação e loading

2. Criar componentes em `src/components/feedback/`:
   - `FeedbackFilters.jsx`:
     - Dropdown de projeto (filtra por projectId)
     - Filtro de rating (1-5, múltipla seleção via badges clicáveis)
     - Date range picker (startDate / endDate)
     - Campo de busca (search no texto da mensagem)
     - Botão "Limpar filtros"
   - `FeedbackCard.jsx`:
     - Mostra: rating (estrelas), mensagem, página de origem, data, badge "Novo"/"Lido"
     - Ações: marcar como lido, deletar
   - `FeedbackList.jsx`:
     - Lista de FeedbackCards
     - Paginação no rodapé
     - Botão "Marcar todos como lidos"
     - Contagem: "Mostrando X de Y feedbacks"

3. Criar `src/app/(dashboard)/projects/[id]/page.js`:
   - Título do projeto no topo + badge com nota média
   - Componentes de filtro + lista abaixo
   - Chama `GET /api/feedbacks?projectId=...` com os filtros

4. Criar `src/components/common/EmptyState.jsx` — ilustração + texto quando não há feedbacks

**Design:** Cards com borda lateral colorida por rating (verde = 5, vermelho = 1), animação de entrada staggered, hover effects, badges coloridos.

**Validação:** Aplicar filtro de rating → lista atualiza. Buscar texto → encontra. Marcar como lido → badge some. Paginação funciona.

---

### TASK-12 — Tela de Projetos e Configuração

**Depende de:** TASK-10
**Módulo:** Dashboard / Projetos
**Resultado esperado:** CRUD visual de projetos + configuração do widget.

**O que fazer:**

1. Criar `src/hooks/useProjects.js` — hook com CRUD de projetos

2. Criar componentes em `src/components/project/`:
   - `ProjectCard.jsx` — card com nome, URL, status (ativo/inativo), contagem de feedbacks, nota média, api_key parcial
   - `ApiKeyDisplay.jsx` — mostra api_key com botão copiar + botão regenerar (com confirmação)
   - `WidgetPreview.jsx` — preview embeddado do widget com as cores/textos configurados

3. Criar `src/app/(dashboard)/projects/page.js`:
   - Grid de ProjectCards
   - Botão "Novo Projeto" no topo
   - Empty state se sem projetos

4. Criar `src/app/(dashboard)/projects/new/page.js`:
   - Formulário: nome do projeto + URL do site
   - Ao criar: mostra modal com api_key e snippet de instalação do widget
   - Botão "Copiar snippet"

5. Criar `src/app/(dashboard)/projects/[id]/settings/page.js`:
   - Formulário de edição: nome, URL, ativo/inativo
   - Seção "API Key": exibe key + botões copiar/regenerar
   - Seção "Widget": personalizar cor, posição (4 opções), textos (prompt + agradecimento). Preview ao lado
   - Seção "Snippet de instalação": código HTML copiável
   - Seção "Zona de perigo": botão deletar projeto (com confirmação)

**Design:** Cards de projeto com gradiente sutil + hover elevação. Snippet de código com syntax highlighting. Color picker nativo para cor do widget. Preview do widget em mini-iframe.

**Validação:** Criar projeto → ver na lista → copiar snippet → editar configurações → regenerar key → deletar.

---

### TASK-13 — Conectar Tudo e Página de Configurações da Conta

**Depende de:** TASK-11, TASK-12
**Módulo:** Dashboard / Integração final
**Resultado esperado:** Dashboard todas as telas integradas com a API, navegação completa, página de settings do user.

**O que fazer:**

1. Criar `src/app/(dashboard)/analytics/page.js`:
   - Seletor de projeto no topo (ou "Todos")
   - Seletor de período (7d / 30d / 90d)
   - Gráficos em grid: ratings ao longo do tempo (line), feedbacks por dia (bar), distribuição de notas (donut), top páginas (ranking)
   - Reutiliza componentes de chart da TASK-10

2. Criar `src/app/(dashboard)/settings/page.js`:
   - Seção "Perfil": nome, email (read-only), avatar URL
   - Seção "Trocar senha": senha atual + nova senha + confirmar
   - Seção "Plano atual": mostra o plano (free/pro/enterprise) e limites

3. Criar `src/components/common/LoadingSpinner.jsx` e `ErrorBoundary.jsx`

4. Configurar `src/app/page.js` (raiz) para redirecionar:
   - Se autenticado → `/dashboard`
   - Se não → `/login`

5. Review geral de navegação — todos os links da sidebar funcionam, breadcrumbs, botões de voltar

6. Testes manuais do fluxo completo:
   - Registro → login → criar projeto → copiar snippet → (simular feedback) → ver no dashboard → filtrar → analytics → settings

**Validação:** Navegar por todas as páginas sem erros. Todos os dados carregam. Fluxo ponta a ponta funciona.

---

## 🟡 WIDGET

---

### TASK-14 — Widget JavaScript Embeddable

**Depende de:** TASK-05 (precisa das rotas `/api/widget/config` e `/api/widget/feedbacks` funcionando)
**Módulo:** Widget
**Resultado esperado:** Script embed.js funcional que cola em qualquer site e coleta feedback.

**O que fazer:**

1. Setup do projeto em `apps/widget/`:
   - `package.json` com devDependencies: `webpack`, `webpack-cli`, `terser-webpack-plugin`
   - `webpack.config.js`:
     - Entry: `src/index.js`
     - Output: `dist/embed.js`, formato IIFE
     - Minificação com Terser
     - Target: `['web', 'es5']` para compatibilidade
     - Sem dependências externas

2. Criar `src/styles.js` — função que retorna string CSS completa do widget:
   - FAB circular (botão flutuante) com ícone de chat/feedback
   - Popup/modal com: header, estrelas, textarea, botão enviar, mensagem de agradecimento
   - Posicionamento configurável (bottom-right, bottom-left, top-right, top-left)
   - Responsivo (mobile: ocupa mais espaço, fontes menores)
   - Animações CSS: fade-in, slide-up para o popup, pulse no FAB
   - Todo CSS com prefixo `ff-` para evitar conflito com site do cliente
   - Ou usar Shadow DOM para isolamento total

3. Criar `src/api.js`:
   - `fetchConfig(apiUrl, apiKey)` → GET /api/widget/config?apiKey=xxx
   - `submitFeedback(apiUrl, data)` → POST /api/widget/feedbacks

4. Criar `src/utils.js`:
   - `createStars(rating)` → gera 5 estrelas SVG clicáveis
   - `escapeHtml(text)` → sanitiza input do usuário
   - Detecção de idioma do browser

5. Criar `src/widget.js` — classe/função principal:
   - `init(config)` — cria elementos no DOM:
     - Container principal
     - FAB (botão flutuante) — ao clicar abre/fecha popup
     - Popup com: título (prompt_text), 5 estrelas interativas, textarea para mensagem, botão "Enviar"
   - Estado interno: isOpen, selectedRating, isSubmitting, isSubmitted
   - Ao selecionar estrela: highlight visual das estrelas até a selecionada
   - Ao enviar: valida rating (obrigatório), envia para API, mostra mensagem de agradecimento (thank_you_text), fecha popup após 2s
   - Erros de rede: mostra mensagem amigável

6. Criar `src/index.js` — entrypoint:
   - Encontra o `<script>` que carregou o widget via `document.currentScript` ou busca por `[data-api-key]`
   - Lê atributos: `data-api-key` (obrigatório), `data-position`, `data-color`
   - Chama API para buscar config do projeto
   - Merge: config da API com overrides dos data-attributes
   - Inicializa widget
   - Envolve tudo em IIFE para não poluir escopo global

7. Criar `apps/widget/test.html` — HTML simples de teste:
   - Página com conteúdo fake
   - Script do widget apontando para localhost
   - Serve para testar o widget durante desenvolvimento

8. Configurar script `build` no package.json: `webpack --mode production`

9. Atualizar a rota `GET /api/widget/embed.js` na API para servir o arquivo `dist/embed.js` com `Content-Type: application/javascript` e cache headers

**Requisitos técnicos:**
- Bundle final < 15KB gzipped
- Zero dependências — JS vanilla puro
- Funciona em Chrome, Firefox, Safari, Edge (últimas 2 versões)
- Não quebra o layout do site do cliente

**Validação:** Abrir test.html → widget aparece no canto → clicar FAB → popup abre → selecionar estrelas → digitar mensagem → enviar → ver agradecimento → verificar no banco que o feedback foi criado.

---

## Resumo de Dependências

| Tarefa | Nome | Depende de |
|--------|------|------------|
| TASK-01 | Setup Monorepo + Infra | — |
| TASK-02 | Banco de Dados (Migrations) | TASK-01 |
| TASK-03 | Autenticação (Auth) | TASK-02 |
| TASK-04 | CRUD de Projetos | TASK-03 |
| TASK-05 | Feedbacks + Widget Endpoints | TASK-04 |
| TASK-06 | Analytics | TASK-05 |
| TASK-07 | Segurança e Proteções | TASK-05 |
| TASK-08 | Setup Dashboard Next.js | TASK-03 |
| TASK-09 | Telas de Auth (Login/Registro) | TASK-08 |
| TASK-10 | Dashboard Overview + Gráficos | TASK-09 |
| TASK-11 | Tela de Feedbacks com Filtros | TASK-10 |
| TASK-12 | Tela de Projetos e Config | TASK-10 |
| TASK-13 | Integração Final + Settings | TASK-11, TASK-12 |
| TASK-14 | Widget JavaScript | TASK-05 |
