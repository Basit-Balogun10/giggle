# Giggle — Local TODO

This file mirrors the managed todo list used by the development agent. Keep this file in sync with the in-memory todo list.

# Todo List

This file is kept in sync with the agent-managed todo list. It represents the current work queue and priorities.

- [-] Resolve Git merge conflicts
  - Resolve all merge conflicts from `git pull origin main`. Files include Convex functions, server controllers, mobile Convex client, pnpm lockfile, and `todo.md`. Prefer incoming Convex-first changes while preserving local mobile UI tokens and important local fixes. Commit the merge.
- [ ] Run pnpm install and regenerate lockfile
  - After resolving `package.json`/dependency changes, run `pnpm install` to update `pnpm-lock.yaml` and ensure workspace consistency.
- [ ] Run TypeScript checks
  - Run `pnpm --filter @giggle/mobile exec tsc --noEmit` and `pnpm --filter @giggle/server exec tsc --noEmit` to catch typing errors introduced by the merge.
- [ ] Quick lint & smoke
  - Run a focused lint check and smoke-run the mobile app and server to catch runtime issues (expo start, server start).
- [ ] Commit merged results and push
  - Commit resolved files with a clear message and push to the feature branch (or open a PR as preferred).

-- Mobile design system & theme (continued)
  - Add theme tokens, hooks, ThemeProvider, and migrate remaining components (counter-modal, auth screens, inputs, switches).

-- Navigation structure (tabs & modal)
  - Bottom tabs: Feed, Post (modal), Wallet, Profile; route wiring under `app/(tabs)`.

-- Feed screen (UI + data)
  - Feed with infinite scroll, gig cards, skeletons and Convex wiring.

-- Post modal & CreateGig flow
  - Post modal UI, form validation, call `api.functions.gigs.createGig` (Convex), optimistic UI update.

-- Convex: server-side functions and schema
  - Create Convex functions/mutations (gigs CRUD, claims, ledger) and types.

-- Convex: mobile client integration
  - Install Convex in mobile, read subscriptions, mobile sign-in & token storage.

-- Auth (Convex-backed)
  - Implement auth flows and link users to Convex records.

-- Claim flow & Paystack (server)
  - Endpoints to create Paystack charge/escrow and manage claim lifecycle.

-- Paystack webhook validation & handling
  - Raw-body HMAC-SHA512 validation and webhook controller added.

-- Wallet & ledger
  - Wallet model, ledger entries, top-ups, holds, and balance calculation.

-- Status chips & badges
  - Token-aware `StatusChip`/`Badge` components.

-- Reels & slide presets
  - Post slide background presets & color picker; reels-style full-screen feed with slides.

-- Misc / long-term
  - Ratings, KYC/admin stubs, testing, CI, deploy, monitoring, accessibility.

-- Notes
  - `todo.md` and the manage_todo_list state are authoritative — keep them in sync.
  - Immediate next steps: finish merge, regenerate lockfile, run type checks.

|   4 | Mobile design system & theme                                 |              ⛳ In progress | Add theme tokens, hooks, ThemeProvider, and NativeWind/Tailwind tokens.                                                                                                   |
|   5 | Navigation structure (tabs & modal)                          |              ⬜ Not started | Bottom tabs: Feed, Post (modal), Wallet, Profile; route wiring under `app/(tabs)`.                                                                                        |
|   6 | Feed screen (UI + data)                                      |                ✅ Completed | Feed with infinite scroll, gig cards, skeletons and server/Convex wiring.                                                                                                 |
|   7 | Post modal & CreateGig flow                                  |              ⬜ Not started | Post modal UI, form validation, call server `POST /api/gigs`, optimistic UI update.                                                                                       |
|   8 | Convex: server-side functions and schema                     |              ⬜ Not started | Create Convex functions/mutations (gigs CRUD, claims, ledger) and types.                                                                                                  |
|   9 | Convex: mobile client integration                            | ⬜ In progress (installing) | Install Convex in mobile, read subscriptions, fallback to server API if needed.                                                                                           |
|  10 | Auth (Convex-backed)                                         |              ⬜ Not started | Implement auth flows and link users to Convex records.                                                                                                                    |
|  11 | Claim flow & Paystack (server)                               |              ⬜ Not started | Endpoints to create Paystack charge/escrow and manage claim lifecycle.                                                                                                    |
|  12 | Paystack webhook validation & handling                       |                ✅ Completed | Raw-body HMAC-SHA512 validation and webhook controller added.                                                                                                             |
|  13 | Wallet & ledger                                              |              ⬜ Not started | Wallet model, ledger entries, top-ups, holds, and balance calculation.                                                                                                    |
|  14 | Ratings & Trust layer                                        |              ⬜ Not started | Ratings model, verification badges, dispute flow, admin endpoints.                                                                                                        |
|  15 | In-app chat (optional)                                       |              ⬜ Not started | Optional realtime chat integration for communication.                                                                                                                     |
|  16 | Notifications (Expo Push)                                    |              ⬜ Not started | Push notifications for claim/payment updates via Expo.                                                                                                                    |
|  17 | KYC stub & admin tools                                       |              ⬜ Not started | Admin endpoints and simple KYC stub for MVP.                                                                                                                              |
|  18 | Testing: unit, integration & E2E                             |              ⬜ Not started | Expand tests and add E2E harness for server+mobile flows.                                                                                                                 |
|  19 | CI & build: mobile production (EAS)                          |                ✅ Completed | GitHub Actions workflow for EAS builds added.                                                                                                                             |
|  20 | CI & build: server production                                |                ✅ Completed | Server CI workflow added (tests/lint/build artifact).                                                                                                                     |
|  21 | Deploy to Render (artifact or build)                         |              ⬜ Not started | Optional GH Action for Render deployment or build instructions.                                                                                                           |
|  22 | Security & hardening                                         |              ⬜ Not started | Input validation, rate limiting, CORS, secrets handling.                                                                                                                  |
|  23 | Monitoring & logging                                         |              ⬜ Not started | Add Sentry/structured logs and metrics/health endpoints.                                                                                                                  |
|  24 | Accessibility & polish                                       |              ⬜ Not started | Accessibility fixes, contrast, touch sizes, animations.                                                                                                                   |
|  25 | Docs, runbooks & secrets guidance                            |              ⬜ Not started | README, QUICK_START, env examples and secrets guidance.                                                                                                                   |
|  26 | Linting, pre-commit hooks & 'no-any' enforcement             |              ⬜ Not started | ESLint rules to ban `any`, Husky pre-commit hooks.                                                                                                                        |
|  27 | USSD companion (stretch)                                     |              ⬜ Not started | Plan/implement a USSD fallback for feature phones (stretch).                                                                                                              |
|  28 | Release & demo prep                                          |              ⬜ Not started | Prepare demo build, sample data and walkthrough script.                                                                                                                   |
|  29 | Reels-style full-screen feed with slides                     |              ⛳ In progress | Implement a full-screen 'reels' feed where each post is full-screen and can contain multiple slides navigable by swipe/tap with slide indicators (WhatsApp-status style). |
|  30 | Post slide background presets & color picker                 |              ⛳ In progress | Allow each slide/post to choose background color from beautiful presets and a subtle color picker for custom choices.                                                     |
|  31 | Status chips & badges                                        |                ✅ Completed | Create token-aware `StatusChip`/`Badge` components and update screens to use token colors for success/warn/error/neutral states.                                          |
|  29 | Reels-style full-screen feed with slides                     |                ✅ Completed | Implement a full-screen 'reels' feed where each post is full-screen and can contain multiple slides navigable by swipe/tap with slide indicators (WhatsApp-status style). |
|  30 | Post slide background presets & color picker                 |                ✅ Completed | Allow each slide/post to choose background color from presets and a subtle color picker for custom choices.                                                               |
|  31 | Status chips & badges                                        |                ✅ Completed | Create token-aware `StatusChip`/`Badge` components and update screens to use token colors for success/warn/error/neutral states.                                          |

---

Notes:

- `todo.md` and the manage_todo_list state are authoritative — update both when changing statuses.
- Current immediate next steps: mobile Convex client installed; next: set `VITE_CONVEX_URL` and implement mobile sign-in UI & token storage.
