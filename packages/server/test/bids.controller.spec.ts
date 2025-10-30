import { describe, it, beforeEach, expect } from 'vitest';

import { BidsController } from '../src/bids.controller';

describe('BidsController (unit)', () => {
  let controller: BidsController;
  const mockConvex = {
    createBid: async (payload: any) => ({
      id: `bid-${Date.now()}`,
      gigId: payload.gigId,
      bidderId: payload.userId,
      amount: payload.amount,
      message: payload.message ?? undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    listBidsByGig: async (gigId: any, userId?: string) => {
      return [
        {
          id: 'b1',
          gigId: typeof gigId === 'object' ? gigId.gigId : gigId,
          bidderId: 'bidder1',
          amount: 500,
          message: 'hello',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
    listBidsByUser: async (payload: any) => {
      const userId = payload && payload.userId ? payload.userId : payload;
      return [
        {
          id: 'ub1',
          gigId: 'g1',
          bidderId: userId,
          amount: 600,
          message: 'my bid',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },
  } as any;

  beforeEach(() => {
    controller = new BidsController(mockConvex as any);
  });

  it('create() returns created bid', async () => {
    const res = await controller.create('g1', { amount: 700, message: 'I am interested' } as any, { user: { id: 'bidder1' } });
    expect((res as any).bidderId).toBe('bidder1');
    expect((res as any)).toHaveProperty('id');
  });

  it('list() returns bids for gig', async () => {
    const res = await controller.list('g1', { user: { id: 'poster1' } });
    expect(Array.isArray(res)).toBe(true);
    expect((res as any)[0]).toHaveProperty('id');
  });

  it('myBids() returns bids for current user', async () => {
    const res = await controller.myBids({ user: { id: 'bidder1' } });
    expect(Array.isArray(res)).toBe(true);
    expect((res as any)[0].bidderId).toBe('bidder1');
  });
});
