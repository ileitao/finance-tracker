# Finance Tracker API

A RESTful API for tracking personal finances — income, expenses, and summaries by category. Built with Node.js, Fastify, TypeScript, PostgreSQL, and Prisma. Deployed on Railway.

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Fastify
- **Language** — TypeScript
- **ORM** — Prisma
- **Database** — PostgreSQL
- **Auth** — JWT + bcrypt
- **Validation** — Zod
- **Deployment** — Railway

---

## Project Structure

```
finance-tracker/
├── prisma/
│   ├── migrations/        # Migration history
│   └── schema.prisma      # Data models
├── src/
│   ├── lib/
│   │   └── prisma.ts      # Prisma client singleton
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts        # Register and login endpoints
│   │   ├── transactions.ts # CRUD endpoints for transactions
│   │   └── summary.ts     # Aggregation endpoints
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   └── transaction.schema.ts
│   ├── types/
│   │   ├── transaction.ts
│   │   ├── summary.ts
│   │   └── user.ts
│   └── server.ts          # Entry point
├── prisma.config.ts        # Prisma configuration
├── Procfile                # Railway deploy command
└── tsconfig.json
```

---

## API Endpoints

### Auth

| Method | Endpoint    | Description                   | Auth required |
| ------ | ----------- | ----------------------------- | ------------- |
| POST   | `/register` | Create a new account          | No            |
| POST   | `/login`    | Login and receive a JWT token | No            |

### Transactions

| Method | Endpoint            | Description              | Auth required |
| ------ | ------------------- | ------------------------ | ------------- |
| GET    | `/transactions`     | List all transactions    | Yes           |
| POST   | `/transactions`     | Create a transaction     | Yes           |
| GET    | `/transactions/:id` | Get a single transaction | Yes           |
| PUT    | `/transactions/:id` | Update a transaction     | Yes           |
| DELETE | `/transactions/:id` | Delete a transaction     | Yes           |

**Query params for `GET /transactions`:**

- `?category=food` — filter by category
- `?month=2026-05` — filter by month (YYYY-MM format)

### Summary

| Method | Endpoint   | Description                                             | Auth required |
| ------ | ---------- | ------------------------------------------------------- | ------------- |
| GET    | `/summary` | Get income, expenses, balance and breakdown by category | Yes           |

**Query params for `GET /summary`:**

- `?month=2026-05` — filter by month (YYYY-MM format)

### Auth header

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ileitao/finance-tracker.git
cd finance-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start PostgreSQL with Docker

```bash
docker run --name finance-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=finance \
  -p 5432:5432 \
  -d postgres:16
```

To start the container again after a machine restart:

```bash
docker start finance-postgres
```

### 4. Configure environment variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance"
JWT_SECRET="your-secret-key"
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Testing the API locally

### Register a user

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Login and get a token

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Create a transaction

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 1500, "type": "income", "category": "salary", "description": "Monthly salary", "date": "2026-05-01"}'
```

### Get summary

```bash
curl http://localhost:3000/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Production Deployment (Railway)

### Prerequisites

- A [Railway](https://railway.app) account connected to GitHub
- A Railway project with a PostgreSQL database provisioned

### Environment variables

Set these in your Railway service variables:

```
DATABASE_URL     # auto-injected by Railway when PostgreSQL is linked
JWT_SECRET       # your production secret key
NODE_ENV         # production
```

### Deploy

Railway automatically deploys on every push to your main branch. The `Procfile` handles the build and migration sequence:

```
web: npm run build && npx prisma migrate deploy && npm start
```

This ensures:

1. TypeScript is compiled
2. Pending migrations are applied to the production database
3. The server starts

---

## Data Models

### User

```
id          String    unique identifier (UUID)
email       String    unique
password    String    bcrypt hashed
createdAt   DateTime
updatedAt   DateTime
```

### Transaction

```
id          String    unique identifier (UUID)
amount      Float     positive number
type        String    "income" or "expense"
category    String    e.g. "food", "salary", "transport"
description String
date        String    YYYY-MM-DD format
userId      String    foreign key → User
createdAt   DateTime
updatedAt   DateTime
```

---

## Scripts

```bash
npm run dev      # start development server with hot reload
npm run build    # compile TypeScript to dist/
npm start        # run compiled server
```

---

## Architecture Notes

- **Layered architecture** — routes are decoupled from the database layer. Swapping Prisma for another ORM would not require changes to route handlers.
- **JWT auth** — tokens are signed with HS256 and expire after 7 days. The payload contains `userId` and `email`.
- **Row-level scoping** — every database query is scoped to the authenticated user's `userId`. Users cannot access each other's data.
- **Database aggregation** — summary totals use Prisma's `aggregate` and `groupBy` methods, pushing computation to PostgreSQL rather than JavaScript.
