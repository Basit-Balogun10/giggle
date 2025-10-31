# Convex Auth — setup notes

This project uses Convex Auth as the single source of truth for authentication.
There are no runtime dev fallbacks — `@convex-dev/auth` must be installed and
properly configured for the server and mobile app to function.

Required packages

- `@convex-dev/auth` (server)
- `@convex-dev/auth/react` (mobile)

Required environment variables (example)

- `AUTH_RESEND_KEY` — API key for Resend (email OTP) provider (if used)
- Any provider-specific keys configured in your Convex Auth provider setup

Quick local setup

1. Install packages:

   pnpm --filter @giggle/server add @convex-dev/auth
   pnpm --filter @giggle/mobile add @convex-dev/auth-react

2. Configure Convex Auth providers in your Convex project (see Convex docs).
   You may use the `convex/ResendOTP.ts` provider scaffold as a starting point.

3. Set provider keys in environment or via `npx convex env set` such as:

   AUTH_RESEND_KEY=your_resend_api_key_here

Notes

- This repository intentionally requires Convex Auth for production and local
  development. If you need CI-friendly tests without a deployed Convex Auth,
  use the mock helper at `packages/server/test/helpers/mockConvexAuth.ts`.
