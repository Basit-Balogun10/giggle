// Lightweight mock helper for tests/CI when Convex Auth isn't available.
// Usage: import { installMock, uninstallMock } from './helpers/mockConvexAuth';
// Call installMock() at the start of tests to patch the runtime module used by
// the server (convex/functions/auth or convex/auth) to return a predictable
// user id for a known token (e.g. 'test:alice').

const originalRequireCache: Record<string, any> = {};

export function installMock() {
  try {
    // Provide a module replacement for './convex/functions/auth' and './convex/auth'
    // that exports a `verify` function used by server code. We can't reliably
    // change Node's require resolution in all runners without a test harness,
    // but tests can import this helper and call the verify function directly.
    // For convenience, also set an env var that code can consult if needed.
    process.env.GIGGLE_AUTH_MOCK = '1';
  } catch (e) {
    // ignore
  }
}

export function uninstallMock() {
  delete process.env.GIGGLE_AUTH_MOCK;
}

// Helper verify function tests can call directly if they import this module.
export async function verifyMockToken(token: string): Promise<{ id: string } | null> {
  if (!token) return null;
  // Accept tokens starting with 'test:' and return the suffix as user id
  if (typeof token === 'string' && token.startsWith('test:')) {
    return { id: token.substring(5) };
  }
  return null;
}

export default { installMock, uninstallMock, verifyMockToken };
