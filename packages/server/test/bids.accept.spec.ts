import { describe, it, expect, beforeEach } from 'vitest';
import { localConvexMock as localConvex } from './helpers/localConvexMock';

describe('localConvex bids acceptance -> ledger/charge integration', () => {
  beforeEach(() => {
    // reset store
    (localConvex as any)._store.gigs = [];
    (localConvex as any)._store.bids = [];
    (localConvex as any)._store.charges = [];
    (localConvex as any)._store.ledger = [];
  });

  it('creates ledger and pending charge when accepting a bid', async () => {
    const gig = await localConvex.mutation('gigs.create', { title: 'AcceptTest', payout: 1000, authorId: 'poster1' });
    const bid = await localConvex.mutation('bids.create', { gigId: gig.id, amount: 500, userId: 'bidder1' });

    const accepted = await localConvex.mutation('bids.accept', { bidId: bid.id, userId: 'poster1' });
    expect(accepted).toHaveProperty('status', 'accepted');

    const store = (localConvex as any)._store;
    // ledger should contain bid_accepted and a hold entry
    const acceptedEntry = store.ledger.find((l: any) => l.type === 'bid_accepted' && l.bidId === bid.id);
    expect(acceptedEntry).toBeDefined();

    const holdEntry = store.ledger.find((l: any) => l.type === 'hold' && l.meta && l.meta.bidId === bid.id);
    expect(holdEntry).toBeDefined();

    // charges should have a pending charge for the bid
    const charge = store.charges.find((c: any) => c.metadata && c.metadata.bidId === bid.id);
    expect(charge).toBeDefined();
    expect(charge.status).toBe('pending');
  });
});
