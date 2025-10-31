// Convex functions for bids using the new Convex function syntax.
// These are ready-to-deploy functions that expect Convex SDK to be installed
// and the schema defined in `convex/schema.ts`.

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// Create a new bid. The authenticated user is derived from ctx.auth.userId.
export const createBid: any = (mutation as any)({
  args: {
    gigId: v.id('gigs'),
    amount: v.number(),
    message: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id('bids'),
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    // Resolve authenticated bidder id (support different auth shapes).
    const bidderId = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId;
    if (!bidderId) throw new Error('Authentication required');

    const now = Date.now();
    const bidId = await ctx.db.insert('bids', {
      gigId: args.gigId,
      bidderId,
      amount: args.amount,
      // Use undefined for optional fields to match validators
      message: args.message ?? undefined,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });

    // Return the inserted document
  const doc: any = await ctx.db.get(bidId as any);
  if (!doc) throw new Error('failed to fetch inserted bid');
    return {
      _id: bidId,
      gigId: doc.gigId,
      bidderId: doc.bidderId,
      amount: doc.amount,
      message: doc.message ?? undefined,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as any;
  },
});

// List bids for a gig. Posters see all bids; bidders see only their own.
export const listByGig: any = (query as any)({
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
    const requester = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId;
    if (!requester) throw new Error('Authentication required');

    const gig: any = await ctx.db.get(args.gigId as any);
    if (!gig) return [];

    // If caller is poster, return all bids for the gig. Otherwise, filter
    // bids client-side to avoid index typing friction in generated types.
  const rows: any[] = await ctx.db.query('bids').order('desc').take(200);
    if (gig.authorId === requester) {
      return rows.filter((r: any) => String(r.gigId) === String(args.gigId));
    }
    return rows.filter((r: any) => String(r.gigId) === String(args.gigId) && String(r.bidderId) === String(requester));
  },
});

// List bids for a user (used by server /bids/me)
export const listByUser: any = (query as any)({
  args: { userId: v.id('users') },
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
    const rows: any[] = await ctx.db.query('bids').order('desc').take(200);
    return rows.filter((r: any) => String(r.bidderId) === String(args.userId));
  },
});

// Update a bid (bidder only)
export const updateBid: any = (mutation as any)({
  args: {
    bidId: v.id('bids'),
    amount: v.optional(v.number()),
    message: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id('bids'),
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const bidder = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId;
    if (!bidder) throw new Error('Authentication required');
    const bid: any = await ctx.db.get(args.bidId as any);
    if (!bid) throw new Error('bid not found');
    if (bid.bidderId !== bidder) throw new Error('not authorized');
    if (bid.status === 'accepted' || bid.status === 'rejected') throw new Error('cannot update finalized bid');
    const patch: any = {};
    if (typeof args.amount === 'number') patch.amount = args.amount;
    if (typeof args.message === 'string') patch.message = args.message;
    patch.updatedAt = Date.now();
    await ctx.db.patch(args.bidId as any, patch as any);
    const updated: any = await ctx.db.get(args.bidId as any);
    return updated;
  },
});

// Counter a bid (poster only)
export const counterBid: any = (mutation as any)({
  args: {
    bidId: v.id('bids'),
    counterAmount: v.number(),
    message: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id('bids'),
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
    counterAmount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const caller = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId;
    if (!caller) throw new Error('Authentication required');
    const bid: any = await ctx.db.get(args.bidId as any);
    if (!bid) throw new Error('bid not found');
    const gig: any = await ctx.db.get(bid.gigId as any);
    if (!gig) throw new Error('gig not found');
    if (gig.authorId !== caller) throw new Error('not authorized');
    const now = Date.now();
    await ctx.db.patch(args.bidId as any, { status: 'countered', counterAmount: args.counterAmount, message: args.message ?? undefined, updatedAt: now } as any);
    const updated: any = await ctx.db.get(args.bidId as any);
    return updated;
  },
});

// Reject a bid (poster only)
export const rejectBid: any = (mutation as any)({
  args: { bidId: v.id('bids') },
  returns: v.object({ _id: v.id('bids'), status: v.string(), updatedAt: v.number() }),
  handler: async (ctx, args) => {
    const caller = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId;
    if (!caller) throw new Error('Authentication required');
    const bid: any = await ctx.db.get(args.bidId as any);
    if (!bid) throw new Error('bid not found');
    const gig: any = await ctx.db.get(bid.gigId as any);
    if (!gig) throw new Error('gig not found');
    if (gig.authorId !== caller) throw new Error('not authorized');
    const now = Date.now();
    await ctx.db.patch(args.bidId as any, { status: 'rejected', updatedAt: now } as any);
    return { _id: args.bidId, status: 'rejected', updatedAt: now } as any;
  },
});

// Accept a bid: transactionally mark the bid accepted, write ledger entries,
// and create a pending charge. This mutation enforces that only the gig author
// (poster) can accept bids for their gig.
export const acceptBid: any = (mutation as any)({
  args: {
    bidId: v.id('bids'),
  },
  returns: v.object({
    _id: v.id('bids'),
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    // Load bid and gig
    const bid: any = await ctx.db.get(args.bidId as any);
    if (!bid) throw new Error('Bid not found');

    if (bid.status !== 'pending') throw new Error('Bid must be pending to accept');

    const gig: any = await ctx.db.get(bid.gigId as any);
    if (!gig) throw new Error('Gig not found');

    const caller = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId;
    if (!caller) throw new Error('Authentication required');
    if (caller !== gig.authorId) throw new Error('Only the gig author may accept bids');

    const now = Date.now();

    // Use `any` for db operations to avoid index/typing friction in generated helpers.
  await ctx.db.patch(args.bidId as any, { status: 'accepted', updatedAt: now } as any);

    // Ledger entry for acceptance (hold)
    await ctx.db.insert('ledger', {
      type: 'bid_accepted',
      amount: bid.amount,
      meta: { bidId: args.bidId, gigId: bid.gigId, posterId: gig.authorId, bidderId: bid.bidderId },
      createdAt: now,
    } as any);

    // Create a pending charge record to be processed by payment/provider
    const chargeId = await ctx.db.insert('charges', {
      amount: bid.amount,
      status: 'pending',
      metadata: { bidId: args.bidId, gigId: bid.gigId },
      createdAt: now,
      updatedAt: now,
    } as any);
    const updated = await ctx.db.get(args.bidId as any);
    return updated;
  },
});
