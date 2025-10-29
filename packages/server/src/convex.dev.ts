// Simple in-memory Convex dev shim for local development/tests.
// Exposes a `mutation(name, payload)` function similar to Convex server client.

type MutationResult = unknown;

const store: { gigs: any[] } = { gigs: [] };

export const devConvex = {
  async mutation(name: string, payload?: unknown): Promise<MutationResult> {
    if (name === 'gigs.create') {
      const p = payload as any;
      const gig = {
        id: `shim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: p.title,
        description: p.description ?? null,
        payout: p.payout ?? 0,
        location: p.location ?? null,
        createdAt: new Date().toISOString(),
        authorId: p.authorId ?? 'shim',
      };
      store.gigs.push(gig);
      return gig;
    }
    // default: return null for unimplemented mutations
    return null;
  },
  // export the store for tests/debugging
  _store: store,
};
