## Finance tracker

It's a REST API for tracking personal finances — income and expenses. 
You can create transactions, list them with filters, and get a summary of your balance broken down by category.

The API is built with `Fastify` and `TypeScript` running on `Node`. When a request comes in — say a `POST /transactions` — `Fastify` parses the JSON body, the route handler takes it, and hands it off to `Prisma` to persist it. `Prisma` translates that into a `SQL INSERT` and sends it to a `PostgreSQL` database.

The data model is simple — a single `Transaction` table with fields for amount, type, category, description, and date. `Prisma` manages the schema — I define the model in schema.prisma, run a migration, and it generates the table and the type-safe client I use in the routes. So I'm never writing raw SQL.

The more interesting route is `GET /summary` — it pulls all transactions for an optional month filter, computes total income and expenses by reducing over the array, calculates the balance, and returns a breakdown by category. 
That aggregation currently happens in JavaScript, though it could move into the database with a `GROUP BY `query if scale became a concern.
The architecture is deliberately layered — the routes don't know anything about `PostgreSQL`, they just call `Prisma` methods. So when I swapped the in-memory array for the real database in Phase 2, the route code barely changed. That's the point.
