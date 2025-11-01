let apiAny: any = {};
// Try a dynamic import path that won't fail TypeScript parsing in environments
// that forbid require(): use global as fallback for dev.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore - dynamic require that may not exist in all environments
  apiAny = (globalThis as any).__convex_generated_api ?? require('../../../convex/_generated/api');
} catch {
  apiAny = {};
}

export const api = apiAny;
