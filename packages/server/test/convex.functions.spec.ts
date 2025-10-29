import { describe, it, expect, beforeEach } from 'vitest';
import { localConvex } from '../src/convex.functions';

describe('localConvex functions', () => {
  beforeEach(() => {
    // reset in-memory store
    (localConvex as any)._store.gigs = [];
    (localConvex as any)._store.charges = [];
    (localConvex as any)._store.ledger = [];
  });

  it('creates and lists gigs', async () => {
    const g1 = await localConvex.mutation('gigs.create', { title: 'G1', payout: 100, tags: ['design'] });
    const g2 = await localConvex.mutation('gigs.create', { title: 'G2', payout: 200, tags: ['dev', 'react'] });
    const list = await localConvex.mutation('gigs.list');
    expect(Array.isArray(list)).toBe(true);
    expect((list as any).length).toBeGreaterThanOrEqual(2);

    const designOnly = await localConvex.mutation('gigs.list', { tag: 'design' });
    expect(Array.isArray(designOnly)).toBe(true);
    expect((designOnly as any).length).toBeGreaterThanOrEqual(1);
  });

  it('creates a charge and records ledger entry', async () => {
    const charge = await localConvex.mutation('claims.createCharge', { amount: 500, metadata: { gigId: 'g1' } });
    expect(charge).toHaveProperty('reference');
    expect(charge).toHaveProperty('status', 'pending');
    const store = (localConvex as any)._store;
    expect(store.charges.length).toBeGreaterThanOrEqual(1);
    expect(store.ledger.length).toBeGreaterThanOrEqual(1);
  });
});
