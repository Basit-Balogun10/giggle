type CreateGigPayload = {
  title: string;
  description?: string;
  payout: number;
  location?: string | null;
  tags?: string[];
};

function getConvexAddress() {
  // Prefer VITE_CONVEX_URL (expo/web), then CONVEX_URL, else localhost dev
  // process.env is available at runtime in RN when bundled via Metro/EAS with env plugin,
  // but dynamic import fallback will handle absence.
  const env = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};
  return env?.VITE_CONVEX_URL || env?.CONVEX_URL || 'http://localhost:8000';
}

export async function createGigWithConvex(payload: CreateGigPayload) {
  try {
    const convexReact = await import('convex/react');
    const ConvexClientCtor = (convexReact as any).ConvexReactClient || (convexReact as any).ConvexClient || (convexReact as any).ConvexClientCtor;
    if (typeof ConvexClientCtor !== 'function') {
      throw new Error('Convex client constructor not found');
    }
    const address = getConvexAddress();
    const client = new ConvexClientCtor(address);
    if (typeof client.mutation !== 'function') {
      throw new Error('Convex client mutation API not available');
    }
    const result = await client.mutation('gigs.create', payload as unknown as Record<string, unknown>);
    return result as unknown;
  } catch (err) {
    // Bubble up error so caller can fallback to server
    throw err;
  }
}

export async function createGigWithRetry(payload: CreateGigPayload, attempts = 3) {
  let attempt = 0;
  let lastErr: unknown = null;
  while (attempt < attempts) {
    try {
      return await createGigWithConvex(payload);
    } catch (err) {
      lastErr = err;
      attempt += 1;
      // exponential backoff
      const backoff = 200 * Math.pow(2, attempt - 1);
      // small delay
  // small delay
  await new Promise<void>((resolve) => setTimeout(() => resolve(), backoff));
    }
  }
  throw lastErr;
}

export default {
  createGigWithConvex,
  createGigWithRetry,
};
