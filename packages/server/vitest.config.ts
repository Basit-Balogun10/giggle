import { defineConfig } from 'vitest/config';

// Server-specific Vitest config: increase test timeout for integration tests
export default defineConfig({
  test: {
    // 20s default timeout to accommodate integration tests that spin up Nest apps
    testTimeout: 20000,
  },
});
