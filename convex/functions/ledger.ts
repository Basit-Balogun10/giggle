// Convex ledger and charge helpers using the new Convex function syntax.
import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

export const recordLedgerEntry = internalMutation({
  args: {
    type: v.string(),
    amount: v.number(),
    meta: v.record(v.string(), v.union(v.string(), v.number(), v.null())),
  },
  returns: v.id('ledger'),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('ledger', { type: args.type, amount: args.amount, meta: args.meta, createdAt: now });
    return id;
  },
});

export const createCharge = internalMutation({
  args: {
    amount: v.number(),
    metadata: v.record(v.string(), v.union(v.string(), v.number(), v.null())),
  },
  returns: v.id('charges'),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('charges', {
      amount: args.amount,
      status: 'pending',
      metadata: args.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});
