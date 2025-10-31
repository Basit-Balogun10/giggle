// Server-side Convex helper for auth verification. This module attempts to
// delegate to the installed `@convex-dev/auth/server` helpers. It is intended
// to be used by server code that needs to verify Convex Auth tokens.

export async function verify(token: string): Promise<{ id: string } | null> {
  if (!token) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const convexAuthModule = require('@convex-dev/auth/server');
    if (convexAuthModule) {
      if (typeof convexAuthModule.verifyToken === 'function') {
        const r = await convexAuthModule.verifyToken(token);
        if (r && r.id) return { id: r.id };
      }
      if (typeof convexAuthModule.verify === 'function') {
        const r = await convexAuthModule.verify(token);
        if (r && r.id) return { id: r.id };
      }
    }
    return null;
  } catch (err: any) {
    throw new Error(`Convex auth verify failed: ${err?.message || String(err)}`);
  }
}

export default { verify };
