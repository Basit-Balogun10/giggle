import { describe, it, expect, beforeEach } from 'vitest';
// Use the in-test mock helper which provides an in-memory localConvex API
import { localConvexMock as localConvex } from './helpers/localConvexMock';

describe('localConvex bids functions', () => {
  beforeEach(() => {
    // reset in-memory store
    (localConvex as any)._store.gigs = [];
    (localConvex as any)._store.charges = [];
    (localConvex as any)._store.ledger = [];
    (localConvex as any)._store.bids = [];
  });

  it('creates bids and enforces visibility and actions', async () => {
    const gig = await localConvex.mutation('gigs.create', { title: 'Bidable', payout: 1000, authorId: 'poster1' });

    // bidder creates a bid
    const b1 = await localConvex.mutation('bids.create', { gigId: gig.id, amount: 500, message: 'I can do this', userId: 'bidder1' });
    expect(b1).toHaveProperty('id');
    expect((b1 as any).status).toBe('pending');

    // poster lists bids and sees it
    const posterView = await localConvex.mutation('bids.listByGig', { gigId: gig.id, userId: 'poster1' });
    expect(Array.isArray(posterView)).toBe(true);
    expect((posterView as any).length).toBeGreaterThanOrEqual(1);

    // another user sees nothing
    const otherView = await localConvex.mutation('bids.listByGig', { gigId: gig.id, userId: 'someoneElse' });
    expect(Array.isArray(otherView)).toBe(true);
    expect((otherView as any).length).toBe(0);

    // bidder sees own bid
    const bidderView = await localConvex.mutation('bids.listByGig', { gigId: gig.id, userId: 'bidder1' });
    expect((bidderView as any).length).toBeGreaterThanOrEqual(1);

    // bidder updates bid
    const updated = await localConvex.mutation('bids.update', { bidId: b1.id, amount: 550, userId: 'bidder1' });
    expect((updated as any).amount).toBe(550);

    // poster counters
    const countered = await localConvex.mutation('bids.counter', { bidId: b1.id, counterAmount: 600, userId: 'poster1' });
    expect((countered as any).status).toBe('countered');
    expect((countered as any).counterAmount).toBe(600);

    // poster accepts
    const accepted = await localConvex.mutation('bids.accept', { bidId: b1.id, userId: 'poster1' });
    expect((accepted as any).status).toBe('accepted');

    // ledger should have an entry for acceptance
    const store = (localConvex as any)._store;
    const ledgerEntry = store.ledger.find((l: any) => l.type === 'bid_accepted' && l.bidId === b1.id);
    expect(ledgerEntry).toBeDefined();
  });
});
