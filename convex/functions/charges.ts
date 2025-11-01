import { internalMutation, query } from '../_generated/server';
import { v } from 'convex/values';

// Internal mutation used by webhooks to update charge status by reference
export const markChargeByReference: any = (internalMutation as any)({
  args: {
    reference: v.string(),
    status: v.string(),
    payload: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.null()))),
  },
  returns: v.object({ reference: v.string(), status: v.string() }),
  handler: async (ctx: any, args: any) => {
    // Find charge by reference stored either on the 'reference' field or inside metadata
    const rows: any[] = await ctx.db.query('charges').order('desc').take(500);
    const charge = rows.find((c: any) => String(c.reference) === String(args.reference) || String(c.metadata?.reference) === String(args.reference));
    if (!charge) throw new Error('charge not found');
    const now = Date.now();
    await ctx.db.patch(charge._id ?? charge.id, { status: args.status, updatedAt: now } as any);
    // Record a ledger entry for success/failure
    await ctx.runMutation('ledger.recordLedgerEntry' as any, { type: `charge.${args.status}`, amount: charge.amount, meta: { reference: args.reference, payload: args.payload ?? {} }, createdAt: now } as any);
    return { reference: args.reference, status: args.status } as any;
  },
});

// Public query to get a charge by reference (helpful for UI/debug)
export const getChargeByReference: any = (query as any)({
  args: { reference: v.string() },
  returns: v.optional(v.object({ reference: v.string(), amount: v.number(), status: v.string() })),
  handler: async (ctx: any, args: any) => {
    const rows: any[] = await ctx.db.query('charges').order('desc').take(500);
    const charge = rows.find((c: any) => String(c.reference) === String(args.reference) || String(c.metadata?.reference) === String(args.reference));
    if (!charge) return null;
    return { reference: charge.reference ?? charge.metadata?.reference, amount: charge.amount, status: charge.status } as any;
  },
});
