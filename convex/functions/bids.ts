// Convex functions for bids using the new Convex function syntax.
// These are ready-to-deploy functions that expect Convex SDK to be installed
// and the schema defined in `convex/schema.ts`.

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Create a new bid. The authenticated user is derived from ctx.auth.userId.
export const createBid = mutation({
  args: {
    gigId: v.id('gigs'),
    amount: v.number(),
    message: v.optional(v.string()),
  },
  returns: v.id('bids'),
  handler: async (ctx, args) => {
    const bidderId = ctx.auth?.userId;
    if (!bidderId) throw new Error('Authentication required');

    const now = Date.now();
    const bidId = await ctx.db.insert('bids', {
      gigId: args.gigId,
      bidderId,
      amount: args.amount,
      message: args.message ?? null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    return bidId;
  },
});

// List bids for a gig. Posters see all bids; bidders see only their own.
export const listByGig = query({
  args: {
    gigId: v.id('gigs'),
  },
  returns: v.array(v.object({
    _id: v.id('bids'),
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const requester = ctx.auth?.userId;
    if (!requester) throw new Error('Authentication required');

    const gig = await ctx.db.get(args.gigId);
    if (!gig) return [];

    if (gig.authorId === requester) {
      // Poster: return all bids for the gig
      const rows = await ctx.db.query('bids').withIndex('by_gig', (q) => q.eq('gigId', args.gigId)).order('desc').take(100);
      return rows;
    }

    // Bidder: return only their own bids for the gig
    const rows = await ctx.db.query('bids').withIndex('by_gig_and_bidder', (q) => q.eq('gigId', args.gigId).eq('bidderId', requester)).order('desc').take(100);
    return rows;
  },
});

// Accept a bid: transactionally mark the bid accepted, write ledger entries,
// and create a pending charge. This mutation enforces that only the gig author
// (poster) can accept bids for their gig.
export const acceptBid = mutation({
  args: {
    bidId: v.id('bids'),
  },
  returns: v.object({
    bidId: v.id('bids'),
    status: v.string(),
    chargeId: v.id('charges'),
  }),
  handler: async (ctx, args) => {
    // Load bid and gig
    const bid = await ctx.db.get(args.bidId as any);
    if (!bid) throw new Error('Bid not found');

    if (bid.status !== 'pending') throw new Error('Bid must be pending to accept');

    const gig = await ctx.db.get(bid.gigId as any);
    if (!gig) throw new Error('Gig not found');

    const caller = ctx.auth?.userId;
    if (!caller) throw new Error('Authentication required');
    if (caller !== gig.authorId) throw new Error('Only the gig author may accept bids');

    const now = Date.now();

    // Perform atomic updates inside this mutation handler (Convex mutations are transactional)
    await ctx.db.patch('bids', args.bidId, { status: 'accepted', updatedAt: now });

    // Ledger entry for acceptance (hold)
    await ctx.db.insert('ledger', {
      type: 'bid_accepted',
      amount: bid.amount,
      meta: { bidId: args.bidId, gigId: bid.gigId, posterId: gig.authorId, bidderId: bid.bidderId },
      createdAt: now,
    });

    // Create a pending charge record to be processed by payment/provider
    const chargeId = await ctx.db.insert('charges', {
      amount: bid.amount,
      status: 'pending',
      metadata: { bidId: args.bidId, gigId: bid.gigId },
      createdAt: now,
      updatedAt: now,
    });

    return { bidId: args.bidId, status: 'accepted', chargeId } as any;
  },
});
