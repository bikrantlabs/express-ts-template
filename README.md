# express-ts-template

Lean Node.js + Express + TypeScript template. Prisma, Postgres, Redis and Mailpit wired up,
Swagger docs generated from the routes, linting and tests included.

## Requirements

Node 22+ and Docker.

## Getting started

```bash
git clone git@github.com:bikrantlabs/express-ts-template.git
cd express-ts-template
npm install
cp .env.example .env
npm run db:up        # starts Postgres + Redis + Mailpit
npm run db:migrate-up # applies Prisma migrations
npm run dev
```

The server needs Postgres and Redis. Without them it retries for ~5s and exits.

Server runs on `http://localhost:3000`, and `/` redirects to the docs.

## Endpoints

| Endpoint                         |                                              |
| -------------------------------- | -------------------------------------------- |
| `GET /`                          | Redirects to the docs                        |
| `GET /api/docs`                  | Swagger UI                                   |
| `GET /api/docs.json`             | Raw OpenAPI spec                             |
| `GET /api/health`                | Liveness                                     |
| `GET /api/health/ready`          | Readiness — 503 if Postgres or Redis is down |
| `GET/POST/PUT/DELETE /api/items` | Demo CRUD, Postgres + Redis cache            |
| `POST /api/contact`              | Demo email, delivered to Mailpit             |

Mailpit's UI is at http://localhost:8025 — mail from `/api/contact` lands there and
nowhere else.

```bash
curl http://localhost:3000/api/health/ready
curl http://localhost:3000/api/items
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" -d '{"name":"test"}'
```

## Scripts

|                                   |                            |
| --------------------------------- | -------------------------- |
| `npm run dev`                     | Dev server with hot reload |
| `npm run build`                   | Compile to `dist/`         |
| `npm start`                       | Run the compiled build     |
| `npm test`                        | Run tests once             |
| `npm run test:watch`              | Tests in watch mode        |
| `npm run typecheck`               | Type-check, no emit        |
| `npm run lint` / `lint:fix`       | ESLint                     |
| `npm run format` / `format:check` | Prettier                   |

### Database

|                                  |                                            |
| -------------------------------- | ------------------------------------------ |
| `npm run db:up`                  | Start containers, wait until healthy       |
| `npm run db:down`                | Stop containers                            |
| `npm run db:reset`               | Wipe volumes, restart, re-apply migrations |
| `npm run db:migrate -- --name x` | Create and apply a development migration   |
| `npm run db:migrate-up`          | Apply pending migrations                   |

Edit `prisma/schema.prisma`, then run `npm run db:migrate -- --name <description>`
to generate and apply a migration. Prisma migration history is stored in
`prisma/migrations/`.

## Adding a feature

```
src/modules/things/
  routes/things.routes.ts          # HTTP only
  schemas/things.schemas.ts        # Zod input validation
  use-cases/*.use-case.ts          # business logic
  repository/things.repository.ts  # Prisma persistence
```

Mount the router in `src/app.ts`. The OpenAPI docs regenerate themselves from the
`@openapi` JSDoc above each handler — there's no separate spec file to update.
