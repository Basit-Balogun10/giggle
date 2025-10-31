import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Public mutation to create a Paystack-style charge record and return its data.
export const createCharge = mutation({
  args: {
    amount: v.number(),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.null()))),
  },
  returns: v.object({
    reference: v.string(),
    amount: v.number(),
    status: v.string(),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.null()))),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const reference = `ps_convex_${now}_${Math.floor(Math.random() * 100000)}`;
    const id = await ctx.db.insert('charges', {
      reference,
      amount: args.amount,
      status: 'pending',
      metadata: args.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    } as any);

    // Also record a ledger hold entry
    await ctx.db.insert('ledger', { id: `l_${now}`, type: 'hold', amount: args.amount, ref: reference, meta: args.metadata ?? {}, createdAt: now } as any);

    return { reference, amount: args.amount, status: 'pending', metadata: args.metadata ?? {} } as any;
  },
});
