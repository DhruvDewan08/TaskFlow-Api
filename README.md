# TaskFlow API

[![CI](https://github.com/DhruvDewan08/TaskFlow-Api/actions/workflows/ci.yml/badge.svg)](https://github.com/DhruvDewan08/TaskFlow-Api/actions/workflows/ci.yml)

A scalable task management REST API built with **Node.js**, **Express.js**, **TypeScript**, **Prisma**, **PostgreSQL**, **Redis**, **JWT**, **Argon2**, and **Zod**.

## Features

- JWT authentication with 15-minute access tokens and 7-day refresh token rotation
- Refresh token reuse detection — compromised sessions are invalidated on replay attacks
- Argon2id password hashing (OWASP recommended)
- Zod schema validation on all request boundaries
- Redis-backed rate limiting (10 req/15min on auth, 100 req/15min on tasks)
- Full task CRUD with priority levels and due dates
- OpenAPI/Swagger documentation at `/api-docs`
- 87%+ test coverage with Jest and Supertest
- GitHub Actions CI (lint, typecheck, test)
- Docker Compose for single-command local setup

## Quick Start (Docker)

```bash
git clone https://github.com/DhruvDewan08/TaskFlow-Api.git
cd TaskFlow-Api
docker compose up --build
```

The API starts at `http://localhost:5003`. Swagger docs at `http://localhost:5003/api-docs`.

For hot-reload development:

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build
```

## Local Development (without Docker)

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL and Redis locally, then:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api-docs` | No | Swagger UI |
| POST | `/auth/register` | No | Register (username, email, password) |
| POST | `/auth/login` | No | Login (email, password) |
| POST | `/auth/refresh` | No | Rotate refresh token |
| POST | `/auth/logout` | No | Revoke refresh token |
| GET | `/tasks` | Bearer | List tasks |
| POST | `/tasks` | Bearer | Create task |
| GET | `/tasks/:id` | Bearer | Get task |
| PUT | `/tasks/:id` | Bearer | Update task |
| DELETE | `/tasks/:id` | Bearer | Delete task |

### Authentication

All protected routes require `Authorization: Bearer <accessToken>`.

Register and login return:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

When the access token expires, call `POST /auth/refresh` with the refresh token to get a new pair.

## Testing

```bash
# Create test database
createdb taskflow_test

# Run migrations against test DB
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow_test npx prisma migrate deploy

# Run tests with coverage
npm test
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm test` | Jest tests with coverage |

## Railway Deployment

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo (`DhruvDewan08/TaskFlow-Api`)
3. Add **PostgreSQL** and **Redis** plugins
4. Set environment variables:
   - `JWT_SECRET` — random string, 32+ characters
   - `REFRESH_SECRET` — random string, 32+ characters
   - `DATABASE_URL` — auto-set by PostgreSQL plugin
   - `REDIS_HOST` / `REDIS_PORT` — from Redis plugin (or parse `REDIS_URL`)
5. Deploy — Railway uses the Dockerfile and `railway.toml` health check on `/health`

Live docs will be at `https://<your-app>.up.railway.app/api-docs`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret (32+ chars) |
| `REFRESH_SECRET` | Yes | Refresh token signing secret (32+ chars) |
| `REDIS_HOST` | Yes | Redis hostname |
| `REDIS_PORT` | No | Redis port (default: 6379) |
| `REDIS_PASSWORD` | No | Redis password |
| `PORT` | No | Server port (default: 5003) |
| `NODE_ENV` | No | `development`, `production`, or `test` |

## Tech Stack

- **Runtime:** Node.js 22, TypeScript
- **Framework:** Express.js 5
- **Database:** PostgreSQL 13, Prisma ORM
- **Cache/Rate Limiting:** Redis 7, ioredis, express-rate-limit
- **Auth:** jsonwebtoken, Argon2
- **Validation:** Zod
- **Testing:** Jest, Supertest
- **Docs:** Swagger (OpenAPI 3.0)
- **CI:** GitHub Actions
- **Deploy:** Docker, Railway

## License

ISC
