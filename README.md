# Mini SMS Gateway

REST API for a mini bulk SMS platform. Users get a wallet of credits, send SMS through mock providers, and get automatic failover and refunds.

**Stack:** TypeScript, Node.js, Express 5, Prisma 6, Supabase PostgreSQL, JWT, Zod, bcryptjs, Vitest + Supertest.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values (JWT secret, Supabase connection strings).
3. `npx prisma migrate deploy`
4. `npx prisma db seed` (creates ROUTE_A, ROUTE_B, ROUTE_C)
5. `npm run dev` (or `npm run build` then `npm start`)
6. `npm run test`

`DATABASE_URL` is the Supabase transaction pooler (port 6543, with `?pgbouncer=true`) used by the app.
`DIRECT_URL` is the direct or session-pooler connection (port 5432) used by Prisma migrations.

## Structure

```
src/
  server.ts, app.ts
  config/env.ts
  db/prisma.ts
  routes/       auth, sms, health
  services/     auth, sms, refund, logs, health
  providers/    mockProvider.ts
  middleware/   auth.ts, errorHandler.ts
  validators/   zod schemas
  utils/        errors, response, validate, phone, sms
prisma/         schema.prisma, migrations, seed.ts
tests/          phone, sms, api tests
```

## Endpoints

Responses are `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details" } }`.
All endpoints except register and login need `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | /auth/register | `{ email, password }`. Creates a user with 100 credits. Returns a token. |
| POST | /auth/login | `{ email, password }`. Returns a token. |
| GET | /wallet | Current credits of the logged-in user. |
| POST | /sms/send | `{ "to": ["9841234567", "+9779801122334"], "message": "Hello" }`. Optional `Idempotency-Key` header. |
| GET | /sms/logs | Query: `page`, `limit` (max 100), `status` (pending, sent, failed), `recipient`, `from`, `to` (ISO dates). |
| GET | /routes/health | Balance and last-24-hour statistics for each provider. |

Status codes: 400 validation or invalid numbers, 401 not logged in, 402 not enough credits, 409 duplicate, 500 unexpected.

## Assumptions

- New users get 100 credits. Price is 1 credit per segment per recipient.
- One message row per recipient, so every recipient has its own status, provider, cost and refund.
- One invalid phone number rejects the whole request (400) and nothing is charged. The error lists every invalid number. This keeps charging simple to reason about.
- Duplicate numbers in one request are merged. Maximum 50 recipients and 1000 characters per request.
- Users can only see their own wallet and messages (the user id comes from the token). The assignment has no admin operations, so there is no admin role.
- Route health is visible to any logged-in user.
- An empty message is rejected with 400.

## Phone numbers

A valid number is 10 digits starting with 97 or 98, optionally prefixed with `+977` or `977`. Spaces and dashes are ignored. It is stored as the normalized 10 digits.

## SMS segments

- GSM-7: up to 160 characters is 1 segment, longer messages use 153 per segment. Characters `^ { } \ [ ~ ] | €` count as 2 characters.
- Unicode: up to 70 characters is 1 segment, longer messages use 67 per segment. Length is counted in UTF-16 units, so an emoji counts as 2.
- If any character is outside the GSM-7 set (Nepali, emoji, and so on), the whole message is Unicode.

## Message status

- `pending`: credits reserved, final result not saved yet.
- `sent`: a provider accepted the message.
- `failed`: every eligible provider failed and the credits were refunded.

Only `pending` to `sent` and `pending` to `failed` are possible. Every change is written as `WHERE status = 'pending'`, so a finished message never changes again.

## Providers

ROUTE_A, ROUTE_B and ROUTE_C are rows in the `Provider` table with `priority`, `balance` and `failureRate`. They are tried in priority order. A provider without enough balance is skipped. If a send fails, the next provider is tried. Provider balance is reserved before sending and given back if the send fails.
For deterministic tests, `failureRate` is set to 0 (always succeeds) or 1 (always fails).

## How credits stay safe

1. **Atomic deduction.** Credits are taken with one SQL statement: `UPDATE "User" SET credits = credits - X WHERE id = ? AND credits >= X`. If no row is updated, there were not enough credits (402). The balance is never read in JavaScript and subtracted afterwards, because two requests could read the same value.
2. **Short transactions.** The deduction and the creation of the `pending` messages happen in one short transaction. The provider call (a slow network operation) happens after the commit, so no database connection is held while waiting for a provider.
3. **Refund once.** When every provider fails, one transaction runs `UPDATE Message SET status = 'failed' WHERE id = ? AND status = 'pending'` and gives the credits back only if a row changed. A second attempt changes 0 rows and refunds nothing.
4. **Database checks.** `CHECK (credits >= 0)` and `CHECK (balance >= 0)` make negative amounts impossible even if there is a bug.
5. **Retries.** With an `Idempotency-Key` header, repeating the request returns the old result and charges nothing. A unique constraint on (user, key, recipient) also stops two simultaneous requests with the same key.
6. **Recovery.** At startup and every minute, messages that are still `pending` after 2 minutes (for example after a crash) are marked failed and refunded, using the same refund-once function.

The acceptance test sends 20 parallel requests from a wallet with 10 credits. Exactly 10 succeed, 10 get 402, the wallet ends at 0 and exactly 10 messages exist (`tests/api.test.ts`).

## Known limits

- A database transaction cannot make an external SMS exactly-once. With real providers, if the SMS was delivered but the app crashed before saving `sent`, recovery would wrongly refund it. With mock providers this cannot happen. For real providers: send a unique message id with each request, ask the provider for the delivery status during recovery, and use delivery webhooks.
- If the app crashes between reserving and releasing a provider balance, that mock balance stays reduced.
- No rate limiting, queue or admin role.

## Route health formula

Over the last 24 hours:

```
successRate = successful attempts / total attempts * 100
no attempts  -> successRate = null, health = 100
balance is 0 -> health = 0
otherwise    -> health = successRate
```

## Tests

`npm run test` runs unit tests (phone numbers, segmentation) and API tests (auth, failover, balance skip, refunds, idempotency, recovery, logs, health, concurrency). The API tests use the configured database, change the provider rows temporarily and restore the seed values at the end. Use a separate test database by setting `DATABASE_URL` and `DIRECT_URL` in the shell before running them.