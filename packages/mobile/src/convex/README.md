Convex integration (mobile)
===========================

This folder contains a small, safe runtime wrapper used by the mobile app.

What it does
- Attempts to dynamically import `convex/react` and, if available, the
  `@convex-dev/auth/react` provider. If both are present the wrapper will
  nest the providers and let Convex initialize normally at runtime.
- Falls back to a no-op provider when the packages are not installed so the app
  keeps working during local development.

How to enable Convex in mobile

1. From repo root install the Convex packages for the mobile workspace (we
   ran this already earlier):

   pnpm --filter @giggle/mobile add convex @convex-dev/auth

2. Set your client-side Convex URL as an environment variable (example uses
   Vite-style env name used in this repo's templates):

   VITE_CONVEX_URL=https://your-project.convex.cloud

3. The project includes a simple sign-in flow under `app/(auth)`:
   - `/(auth)/sign-in` — enter phone (or dev id) and request an OTP (dev fallback)
   - `/(auth)/verify-otp` — enter OTP to finish sign-in. The app will persist a
     small dev token using `expo-secure-store` when available.

4. If you install `@convex-dev/auth/react` and configure Convex Auth in your
   Convex project, the runtime will pick up the real auth provider automatically
   (the `ConvexProvider` uses dynamic imports and will nest any found
   `ConvexAuthProvider`).

Secure storage
- We attempt to use `expo-secure-store` to persist tokens. If it's not
  installed, the app falls back to a volatile in-memory session (dev only).

Notes
- This file uses dynamic imports to avoid bundler/runtime errors when Convex
  packages are not installed. When you add Convex packages and rebuild, the
  provider wrapper will automatically wire up.
