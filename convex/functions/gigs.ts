// Convex functions for gigs: list, listTags and createGig
// Uses the new Convex function syntax and validators per repo conventions.
import { query, mutation } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    tag: v.optional(v.string()),
    q: v.optional(v.string()),
    minPayout: v.optional(v.number()),
    maxPayout: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id('gigs'),
    title: v.string(),
    description: v.optional(v.string()),
    payout: v.number(),
    location: v.optional(v.string()),
    authorId: v.optional(v.id('users')),
    createdAt: v.number(),
    updatedAt: v.number(),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    // Basic list implementation: simple scan with optional filters.
    // For production paging and indexes should be used.
    const limit = args.limit ?? 50;

    // Start with a simple query over gigs. Convex returns in ascending creation time
    // by default; we'll reverse on the client if needed.
    let q = ctx.db.query('gigs');

    // Apply a simple full-text-ish filter using title/description contains if q provided.
    // Convex doesn't provide rich text search here; this is a naive filter implemented in JS.
    const rows = await q.order('desc').take(limit);
    const filtered = rows.filter((r: any) => {
      if (args.tag) {
        // If tags were part of schema this would check them; schema currently doesn't include tags
        // so this will be a no-op. Keep the branch for forward-compatibility.
      }
      if (args.minPayout !== undefined && typeof r.payout === 'number') {
        if (r.payout < args.minPayout) return false;
      }
      if (args.maxPayout !== undefined && typeof r.payout === 'number') {
        if (r.payout > args.maxPayout) return false;
      }
      if (args.q) {
        const needle = String(args.q).toLowerCase();
        const title = (r.title || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        if (!title.includes(needle) && !desc.includes(needle)) return false;
      }
      return true;
    });

    return filtered;
  },
});

export const listTags = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    // Lightweight tags listing: scan gigs for a `tags` field (array) if present.
    const rows = await ctx.db.query('gigs').take(200);
    const tagSet = new Set<string>();
    for (const r of rows) {
      if (Array.isArray((r as any).tags)) {
        for (const t of (r as any).tags) tagSet.add(String(t));
      }
    }
    return Array.from(tagSet).slice(0, 100);
  },
});

export const createGig = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    payout: v.number(),
    location: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id('gigs'),
    title: v.string(),
    description: v.optional(v.string()),
    payout: v.number(),
    location: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    authorId: v.optional(v.id('users')),
    createdAt: v.number(),
    updatedAt: v.number(),
    _creationTime: v.number(),
  }),
  handler: async (ctx, args) => {
    const authorId = (ctx.auth as any)?.user?.id ?? (ctx.auth as any)?.userId ?? undefined;
    const now = Date.now();
    const id = await ctx.db.insert('gigs', {
      title: args.title,
      description: args.description ?? undefined,
      payout: args.payout,
      location: args.location ?? undefined,
      tags: args.tags ?? undefined,
      authorId,
      createdAt: now,
      updatedAt: now,
    });

    // Return the inserted document so callers (server/mobile) get the full shape
    const doc = await ctx.db.get(id as any);
    if (!doc) throw new Error('failed to fetch inserted gig');
    return {
      _id: id,
      title: doc.title,
      description: doc.description ?? undefined,
      payout: doc.payout,
      location: doc.location ?? undefined,
      tags: doc.tags ?? undefined,
      authorId: doc.authorId ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      _creationTime: doc._creationTime,
    } as any;
  },
});
