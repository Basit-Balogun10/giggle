import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

// Include Convex Auth tables plus app-specific tables. Add indexes as needed.
export default defineSchema({
  ...authTables,

  gigs: defineTable({
    title: v.string(),
    description: v.string(),
    payout: v.number(),
    location: v.optional(v.string()),
    authorId: v.id('users'),
  }),

  bids: defineTable({
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
  }),

  ledger: defineTable({
    type: v.string(),
    amount: v.number(),
    meta: v.record(v.string(), v.union(v.string(), v.number(), v.null())),
  }),

  charges: defineTable({
    amount: v.number(),
    status: v.string(),
    metadata: v.record(v.string(), v.union(v.string(), v.number(), v.null())),
  }),
});
