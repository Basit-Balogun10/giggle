# Giggle — Local TODO

This file mirrors the managed todo list used by the development agent. Keep this file in sync with the in-memory todo list.

- [x] Fix mobile TypeScript issues
  - Run `pnpm --filter @giggle/mobile exec tsc --noEmit` and fix remaining TypeScript errors in the mobile package until the typecheck is clean.
- [x] Remove defensive fallback & add DI sanity test
  - Remove runtime fallback in `gigs.controller.ts` and add `test/di.sanity.spec.ts` to check DI wiring.
- [x] Wire Convex: implement gigs.create mutation (dev shim)
  - Add minimal Convex dev shim so `ConvexService` can call `mutation('gigs.create', ...)`.
- [x] Implement claim/payment endpoints (Paystack charge creation)
  - Add `ClaimsController` POST `/api/claims` returning a pending Paystack charge placeholder and tests.
- [ ] Mobile design system & theme
  - Add theme tokens, hooks, ThemeProvider, and NativeWind/Tailwind tokens.
- [ ] Navigation structure (tabs & modal)
  - Bottom tabs: Feed, Post (modal), Wallet, Profile; route wiring under `app/(tabs)`.
- [x] Feed screen (UI + data)
  - Feed with infinite scroll, gig cards, skeletons and server/Convex wiring.
- [ ] Post modal & CreateGig flow
  - Post modal UI, form validation, call server `POST /api/gigs`, optimistic UI update.
- [ ] Convex: server-side functions and schema
  - Create Convex functions/mutations (gigs CRUD, claims, ledger) and types.
- [ ] Convex: mobile client integration
  - Install Convex in mobile, read subscriptions, fallback to server API if needed.
- [ ] Auth (Convex-backed)
  - Implement auth flows and link users to Convex records.
- [ ] Claim flow & Paystack (server)
  - Endpoints to create Paystack charge/escrow and manage claim lifecycle.
- [x] Paystack webhook validation & handling
  - Raw-body HMAC-SHA512 validation and webhook controller added.
- [ ] Wallet & ledger
  - Wallet model, ledger entries, top-ups, holds, and balance calculation.
- [ ] Ratings & Trust layer
  - Ratings model, verification badges, dispute flow, admin endpoints.
- [ ] In-app chat (optional)
  - Optional realtime chat integration for communication.
- [ ] Notifications (Expo Push)
  - Push notifications for claim/payment updates via Expo.
- [ ] KYC stub & admin tools
  - Admin endpoints and simple KYC stub for MVP.
- [ ] Testing: unit, integration & E2E
  - Expand tests and add E2E harness for server+mobile flows.
- [x] CI & build: mobile production (EAS)
  - GitHub Actions workflow for EAS builds added.
- [x] CI & build: server production
  - Server CI workflow added (tests/lint/build artifact).
- [ ] Deploy to Render (artifact or build)
  - Optional GH Action for Render deployment or build instructions.
- [ ] Security & hardening
  - Input validation, rate limiting, CORS, secrets handling.
- [ ] Monitoring & logging
  - Add Sentry/structured logs and metrics/health endpoints.
- [ ] Accessibility & polish
  - Accessibility fixes, contrast, touch sizes, animations.
- [ ] Docs, runbooks & secrets guidance
  - README, QUICK_START, env examples and secrets guidance.
- [ ] Linting, pre-commit hooks & 'no-any' enforcement
  - ESLint rules to ban `any`, Husky pre-commit hooks.
- [ ] USSD companion (stretch)
  - Plan/implement a USSD fallback for feature phones (stretch).
- [ ] Release & demo prep
  - Prepare demo build, sample data and walkthrough script.
- [ ] Reels-style full-screen feed with slides (IN-PROGRESS)
  - Implement a full-screen 'reels' feed where each post is full-screen and can contain multiple slides navigable by swipe/tap with slide indicators (WhatsApp-status style).
- [ ] Post slide background presets & color picker
  - Allow each slide/post to choose background color from beautiful presets and a subtle color picker for custom choices.

--
Generated/updated by the development assistant to keep local `todo.md` in sync with the managed todo list.
# Giggle long-term todo

This file is the authoritative, long-term todo list for the project. Do not overwrite without updating the manage_todo_list tool.

| # | Title | Status | One-line description |
|---:|---|---:|---|
| 1 | Remove defensive fallback & add DI sanity test | ✅ Completed | Remove runtime fallback in `gigs.controller.ts` and add `test/di.sanity.spec.ts` to check DI wiring. |
| 2 | Wire Convex: implement gigs.create mutation (dev shim) | ✅ Completed | Add minimal Convex dev shim so `ConvexService` can call `mutation('gigs.create', ...)`. |
| 3 | Implement claim/payment endpoints (Paystack charge creation) | ✅ Completed | Add `ClaimsController` POST `/api/claims` returning a pending Paystack charge placeholder and tests. |
| 4 | Mobile design system & theme | ⬜ Not started | Add theme tokens, hooks, ThemeProvider, and NativeWind/Tailwind tokens. |
| 5 | Navigation structure (tabs & modal) | ⬜ Not started | Bottom tabs: Feed, Post (modal), Wallet, Profile; route wiring under `app/(tabs)`. |
| 6 | Feed screen (UI + data) | ✅ Completed | Feed with infinite scroll, gig cards, skeletons and server/Convex wiring. |
| 7 | Post modal & CreateGig flow | ⬜ Not started | Post modal UI, form validation, call server `POST /api/gigs`, optimistic UI update. |
| 8 | Convex: server-side functions and schema | ⬜ Not started | Create Convex functions/mutations (gigs CRUD, claims, ledger) and types. |
| 9 | Convex: mobile client integration | ⬜ In progress (installing) | Install Convex in mobile, read subscriptions, fallback to server API if needed. |
| 10 | Auth (Convex-backed) | ⬜ Not started | Implement auth flows and link users to Convex records. |
| 11 | Claim flow & Paystack (server) | ⬜ Not started | Endpoints to create Paystack charge/escrow and manage claim lifecycle. |
| 12 | Paystack webhook validation & handling | ✅ Completed | Raw-body HMAC-SHA512 validation and webhook controller added. |
| 13 | Wallet & ledger | ⬜ Not started | Wallet model, ledger entries, top-ups, holds, and balance calculation. |
| 14 | Ratings & Trust layer | ⬜ Not started | Ratings model, verification badges, dispute flow, admin endpoints. |
| 15 | In-app chat (optional) | ⬜ Not started | Optional realtime chat integration for communication. |
| 16 | Notifications (Expo Push) | ⬜ Not started | Push notifications for claim/payment updates via Expo. |
| 17 | KYC stub & admin tools | ⬜ Not started | Admin endpoints and simple KYC stub for MVP. |
| 18 | Testing: unit, integration & E2E | ⬜ Not started | Expand tests and add E2E harness for server+mobile flows. |
| 19 | CI & build: mobile production (EAS) | ✅ Completed | GitHub Actions workflow for EAS builds added. |
| 20 | CI & build: server production | ✅ Completed | Server CI workflow added (tests/lint/build artifact). |
| 21 | Deploy to Render (artifact or build) | ⬜ Not started | Optional GH Action for Render deployment or build instructions. |
| 22 | Security & hardening | ⬜ Not started | Input validation, rate limiting, CORS, secrets handling. |
| 23 | Monitoring & logging | ⬜ Not started | Add Sentry/structured logs and metrics/health endpoints. |
| 24 | Accessibility & polish | ⬜ Not started | Accessibility fixes, contrast, touch sizes, animations. |
| 25 | Docs, runbooks & secrets guidance | ⬜ Not started | README, QUICK_START, env examples and secrets guidance. |
| 26 | Linting, pre-commit hooks & 'no-any' enforcement | ⬜ Not started | ESLint rules to ban `any`, Husky pre-commit hooks. |
| 27 | USSD companion (stretch) | ⬜ Not started | Plan/implement a USSD fallback for feature phones (stretch). |
| 28 | Release & demo prep | ⬜ Not started | Prepare demo build, sample data and walkthrough script. |
| 29 | Reels-style full-screen feed with slides | ⛳ In progress | Implement a full-screen 'reels' feed where each post is full-screen and can contain multiple slides navigable by swipe/tap with slide indicators (WhatsApp-status style). |
| 30 | Post slide background presets & color picker | ⬜ Not started | Allow each slide/post to choose background color from beautiful presets and a subtle color picker for custom choices. |

---

Notes:
- `todo.md` and the manage_todo_list state are authoritative — update both when changing statuses.
- Current immediate next steps: mobile Convex client installed; next: set `VITE_CONVEX_URL` and implement mobile sign-in UI & token storage.
