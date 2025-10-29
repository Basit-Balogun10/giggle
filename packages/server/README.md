# Giggle Server (scaffold)

This is a minimal NestJS-style scaffold to start the Giggle backend. It's intentionally minimal so you can add dependencies with pnpm yourself (preferred):

Recommended next steps:

1. From repository root run:

```bash
pnpm -w install
```

2. Add server dependencies from repo root (example):

```bash
pnpm --filter @giggle/server add @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata
pnpm --filter @giggle/server add -D typescript ts-node-dev @types/node
```

3. Start the server in dev mode:

```bash
pnpm --filter @giggle/server run start:dev
```

Notes:
- We keep the server strict (see tsconfig.json). Avoid `any` unless absolutely necessary.
- When ready we can wire Convex, Paystack webhooks, and stricter schema tooling.
 - When ready we can wire Convex, Paystack webhooks, and stricter schema tooling.

Paystack webhook notes
---------------------

Paystack signs webhook payloads with HMAC-SHA512 using your webhook secret. To validate
the signature correctly you must compute the HMAC over the raw request bytes. The server
scaffold includes a webhook controller (`src/paystack.controller.ts`) that expects the raw
body to be attached on `req.rawBody` (Express).

To capture the raw body with Express in this Nest-style scaffold, add middleware in
`src/main.ts` before the router is mounted:

```ts
import express from 'express';
const rawParser = express.raw({ type: 'application/json' });
app.use('/api/paystack/webhook', (req, res, next) => rawParser(req as any, res as any, next));
```

Convex notes
-----------

This scaffold includes a `ConvexService` with a lazy loader; you can install the official
Convex package when ready:

```bash
pnpm --filter @giggle/server add convex
```

After installing, replace the placeholder mutation call in `src/convex.service.ts` with
your Convex mutations (for example `client.mutation('gigs.create', payload)`).

