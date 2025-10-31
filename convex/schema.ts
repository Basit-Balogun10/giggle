import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

// Include Convex Auth tables plus app-specific tables. Add indexes as needed.
export default defineSchema({
  ...authTables,

  gigs: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    payout: v.number(),
    location: v.optional(v.string()),
    // Allow optional tags array for filtering and discovery
    tags: v.optional(v.array(v.string())),
  authorId: v.optional(v.id('users')),
    // Timestamps for ordering and returned shapes
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  bids: defineTable({
    gigId: v.id('gigs'),
    bidderId: v.id('users'),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_gig', ['gigId']).index('by_gig_and_bidder', ['gigId', 'bidderId']),

  ledger: defineTable({
    type: v.string(),
    amount: v.number(),
    meta: v.record(v.string(), v.union(v.string(), v.number(), v.null())),
    createdAt: v.number(),
  }),

  charges: defineTable({
    amount: v.number(),
    status: v.string(),
    metadata: v.record(v.string(), v.union(v.string(), v.number(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
