import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create gig mutation: requires authenticated user
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    payout: v.number(),
    location: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("gigs"),
  handler: async (ctx, args) => {
    const authorId = ctx.auth?.userId;
    if (!authorId) throw new Error("Authentication required");

    const now = Date.now();
    const id = await ctx.db.insert("gigs", {
      title: args.title,
      description: args.description ?? "",
      payout: args.payout ?? 0,
      location: args.location ?? null,
      authorId,
      createdAt: now,
      updatedAt: now,
      tags: args.tags ?? [],
    } as any);
    return id;
  },
});

// List gigs with simple filters: tag, minPayout, maxPayout, q (search)
export const list = query({
  args: {
    filter: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.null()))
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("gigs"),
      title: v.string(),
      description: v.string(),
      payout: v.number(),
      location: v.optional(v.string()),
      authorId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const f = (args.filter as any) || {};

    // Basic query: return newest first, then apply in-memory filters for now
    // For production add indexes and server-side filters.
    const rows = await ctx.db.query("gigs").order("desc").take(200);
    let out = rows as any[];
    if (f.tag) {
      out = out.filter(
        (g) => Array.isArray(g.tags) && g.tags.includes(String(f.tag))
      );
    }
    if (typeof f.minPayout === "number")
      out = out.filter((g) => g.payout >= Number(f.minPayout));
    if (typeof f.maxPayout === "number")
      out = out.filter((g) => g.payout <= Number(f.maxPayout));
    if (f.q) {
      const needle = String(f.q).toLowerCase();
      out = out.filter(
        (g) =>
          (g.title && g.title.toLowerCase().includes(needle)) ||
          (g.description && g.description.toLowerCase().includes(needle))
      );
    }
    return out;
  },
});

export default {
  create,
  list,
};
