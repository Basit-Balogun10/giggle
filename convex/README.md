# Convex — deploy & test guide

This folder contains Convex server functions scaffolds used by Giggle (see `convex/functions/*`).

Quick deploy steps

1. Install the Convex CLI and SDK locally (if not already):

   npm install -g convex

2. Authenticate and create a project in Convex dashboard. Set your project URL and server key as environment variables or via Convex CLI.

3. Deploy schema and functions:

   npx convex deploy

4. Set Convex env secrets (server-side keys):

   npx convex env set CONVEX_SERVER_KEY your_server_key
   npx convex env set AUTH_RESEND_KEY your_resend_key

Testing Convex functions locally

- You have two options:
  1. Use the repo's local dev shims for fast unit-style tests (the server `packages/server/src/convex.functions.ts` mirrors expected Convex behavior). You can write unit tests that call the dev shims directly.
  2. Deploy to a Convex test project and run integration tests against it. Use a Convex test project with separate credentials and configure CI secrets accordingly.

Example CI job (GitHub Actions)

Below is an example snippet you can adapt to run Convex function tests in CI against a test Convex project.

```yaml
name: Convex function tests
on: [push, pull_request]
jobs:
  convex-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Setup Convex
        run: npm install -g convex
      - name: Set Convex env
        env:
          CONVEX_SERVER_KEY: ${{ secrets.CONVEX_TEST_SERVER_KEY }}
          CONVEX_URL: ${{ secrets.CONVEX_TEST_URL }}
        run: |
          npx convex env set CONVEX_SERVER_KEY $CONVEX_SERVER_KEY
          npx convex env set CONVEX_URL $CONVEX_URL
      - name: Run Convex function integration tests
        env:
          CONVEX_URL: ${{ secrets.CONVEX_TEST_URL }}
        run: pnpm --filter @giggle/server test:convex
```

Notes and recommendations

- Keep Convex test credentials in CI secrets and never in the repo.
- Prefer using the local dev shim for fast unit tests; reserve integration tests for important transactional flows like `bids.accept`.
- For `bids.accept` ensure you run tests against an isolated Convex project to avoid race conditions and cross-test interference.

If you'd like, I can add a small example test harness that calls the repo's dev shim and a sample GitHub Actions job file in `.github/workflows/`.
