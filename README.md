# FeedbackFlow

> Collect user feedback on any website with a lightweight embeddable widget. Manage responses, track ratings over time, and configure everything from a self-hosted dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                      INTERNET                       │
└──────┬───────────────────────┬──────────────────────┘
       │                       │
       ▼                       ▼
 ┌───────────┐          ┌────────────┐
 │ Dashboard │          │   Widget   │
 │ (Next.js) │          │  (JS pure) │
 │  :3001    │          │  embed.js  │
 └─────┬─────┘          └──────┬─────┘
       │                       │
       └──────────┬────────────┘
                  ▼
          ┌──────────────┐
          │  API Express │
          │    :3333     │
          └──────┬───────┘
                 │
          ┌──────▼───────┐
          │  PostgreSQL  │
          │    :5432     │
          └──────────────┘
```

| Part          | Stack      | Port | Description                              |
|---------------|------------|------|------------------------------------------|
| **API**       | Express.js | 3333 | REST backend — all business logic        |
| **Dashboard** | Next.js 14 | 3001 | Admin panel — charts, filters, settings  |
| **Widget**    | Vanilla JS | —    | Lightweight embeddable script            |

---

## Features

- **Embeddable widget** — drop a `<script>` tag on any site, zero dependencies, < 9 KB
- **Star rating + message** — visitors leave 1–5 stars and an optional comment
- **Dashboard** — overview KPIs, charts (Recharts), feedback list with filters
- **Analytics** — ratings over time, feedbacks per day, top pages, rating distribution
- **Project management** — multiple projects, per-project widget customization (color, position, texts)
- **API Key auth** — widget uses API keys; dashboard uses JWT
- **Security** — Helmet, rate limiting (global / auth / widget), CORS, input sanitization
- **Monorepo** — npm workspaces with shared packages

---

## Tech Stack

| Layer      | Technologies                                    |
|------------|-------------------------------------------------|
| API        | Node.js, Express, Knex, PostgreSQL, Zod, JWT    |
| Dashboard  | Next.js 14 (App Router), React 18, Recharts     |
| Widget     | Vanilla JS ES5, Webpack, Terser                 |
| Database   | PostgreSQL 16 (Docker)                          |
| Auth       | JWT (Bearer token) + bcryptjs                  |

---

## Project Structure

```
feedbackflow/
├── apps/
│   ├── api/                  # Express REST API
│   │   ├── src/
│   │   │   ├── config/       # env, database, cors
│   │   │   ├── middlewares/  # auth, apiKey, validate, rateLimiter, errorHandler
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── projects/
│   │   │   │   ├── feedbacks/
│   │   │   │   ├── widget/
│   │   │   │   └── analytics/
│   │   │   └── utils/
│   │   └── src/database/
│   │       ├── migrations/   # 5 migrations (users, projects, feedbacks, ...)
│   │       └── seeds/        # dev seed with sample data
│   ├── dashboard/            # Next.js admin panel
│   │   └── src/
│   │       ├── app/          # App Router pages
│   │       │   ├── (auth)/   # login, register, forgot/reset password
│   │       │   └── (dashboard)/ # dashboard, projects, analytics, settings
│   │       ├── components/   # ui/, layout/, charts/, feedback/, project/, common/
│   │       ├── hooks/        # useAuth, useProjects, useFeedbacks, useAnalytics
│   │       └── lib/          # api client, utils
│   └── widget/               # Embeddable JS widget
│       ├── src/              # index, widget, api, styles, utils
│       └── dist/             # embed.js (pre-built, ~9 KB)
└── packages/
    └── shared/               # constants, JSDoc types
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Clone and install

```bash
git clone https://github.com/rafaelsoto/labai-saas-example.git
cd labai-saas-example
npm install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
```

The defaults work out of the box for local development — no changes needed.

### 4. Run migrations and seed

```bash
cd apps/api
node ../../node_modules/.bin/knex migrate:latest --knexfile knexfile.js
node ../../node_modules/.bin/knex seed:run --knexfile knexfile.js
cd ../..
```

### 5. Start the API

```bash
cd apps/api
node ../../node_modules/.bin/nodemon src/server.js
```

### 6. Start the Dashboard (new terminal)

```bash
cd apps/dashboard
node ../../node_modules/.bin/next dev -p 3001
```

---

## Seed Credentials

| Email               | Password    | Plan |
|---------------------|-------------|------|
| ana@example.com     | password123 | pro  |
| bruno@example.com   | password123 | free |

---

## API Endpoints

### Auth
| Method | Endpoint                    | Auth     |
|--------|-----------------------------|----------|
| POST   | `/api/auth/register`        | —        |
| POST   | `/api/auth/login`           | —        |
| GET    | `/api/auth/me`              | JWT      |
| PUT    | `/api/auth/me`              | JWT      |
| PUT    | `/api/auth/change-password` | JWT      |
| POST   | `/api/auth/forgot-password` | —        |
| POST   | `/api/auth/reset-password`  | —        |

### Projects
| Method | Endpoint                          | Auth |
|--------|-----------------------------------|------|
| GET    | `/api/projects`                   | JWT  |
| POST   | `/api/projects`                   | JWT  |
| GET    | `/api/projects/:id`               | JWT  |
| PUT    | `/api/projects/:id`               | JWT  |
| DELETE | `/api/projects/:id`               | JWT  |
| POST   | `/api/projects/:id/regenerate-key`| JWT  |

### Feedbacks
| Method | Endpoint                    | Auth    |
|--------|-----------------------------|---------|
| GET    | `/api/feedbacks`            | JWT     |
| GET    | `/api/feedbacks/:id`        | JWT     |
| PATCH  | `/api/feedbacks/:id/read`   | JWT     |
| PATCH  | `/api/feedbacks/read-all`   | JWT     |
| DELETE | `/api/feedbacks/:id`        | JWT     |

### Widget
| Method | Endpoint                    | Auth    |
|--------|-----------------------------|---------|
| GET    | `/api/widget/embed.js`      | —       |
| GET    | `/api/widget/config`        | API Key |
| POST   | `/api/widget/feedbacks`     | API Key |

### Analytics
| Method | Endpoint                          | Auth |
|--------|-----------------------------------|------|
| GET    | `/api/analytics/overview`         | JWT  |
| GET    | `/api/analytics/project/:id`      | JWT  |
| GET    | `/api/analytics/ratings-over-time`| JWT  |
| GET    | `/api/analytics/feedbacks-per-day`| JWT  |
| GET    | `/api/analytics/top-pages`        | JWT  |

---

## Widget Installation

1. Create a project in the dashboard
2. Copy your **API Key** from the project settings
3. Add the snippet before `</body>` on your site:

```html
<script
  src="http://localhost:3333/api/widget/embed.js"
  data-api-key="ff_proj_your_key_here"
  defer>
</script>
```

### Optional attributes

| Attribute       | Values                                          | Default        |
|-----------------|-------------------------------------------------|----------------|
| `data-position` | `bottom-right` `bottom-left` `top-right` `top-left` | `bottom-right` |
| `data-color`    | Any hex color                                   | `#6366f1`      |

### Testing the widget locally

Open `apps/widget/test.html` in your browser after replacing `YOUR_API_KEY_HERE` with a real project key.

---

## Building the Widget

The pre-built `dist/embed.js` is included in the repo. To rebuild after changes:

```bash
cd apps/widget
npm install
node ../../../node_modules/.bin/webpack --config webpack.config.js --mode production
```

---

## Health Check

```bash
curl http://localhost:3333/api/health
# {"status":"ok","uptime":42,"timestamp":"..."}
```

---

## License

MIT
