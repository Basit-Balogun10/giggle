# Convex Functions — Bidding & Ledger (example)

This doc shows a scaffold for how to implement the bidding, counter, accept/reject flows as Convex server functions for production. The local `convex.functions.ts` is a dev shim that mirrors this behavior.

Important goals:
- All critical state transitions (accept, counter) must be performed inside a server-side function/transaction to avoid races.
- Acceptance should: set bid status → create ledger entry → create pending claim (hold) or call payment provider.

Example Convex functions (pseudocode)

1) bids/create
```
// signature: ({ gigId, amount, message }, ctx)
export default async function create({ gigId, amount, message }, ctx) {
  const userId = ctx.auth.userId;
  if (!userId) throw new Error('unauthenticated');
  const gig = await db.query('gigs').get(gigId);
  if (!gig) throw new Error('gig not found');
  const bid = await db.table('bids').insert({
    gigId,
    bidderId: userId,
    amount,
    message,
    status: 'pending',
    createdAt: now,
  });
  return bid;
}
```

2) bids/accept (important: transactional)
```
/\* signature: ({ bidId }, ctx) \*/
export default async function accept({ bidId }, ctx) {
  const userId = ctx.auth.userId;
  if (!userId) throw new Error('unauthenticated');

  // Use a transaction where available in Convex (or implement compare-and-swap style)
  return await db.transaction(async (tx) => {
    const bid = await tx.table('bids').get(bidId);
    if (!bid) throw new Error('bid not found');
    const gig = await tx.table('gigs').get(bid.gigId);
    if (!gig) throw new Error('gig not found');
    if (gig.authorId !== userId) throw new Error('not authorized');
    if (bid.status === 'accepted') return bid; // idempotent

    // set status
    await tx.table('bids').update(bidId, { status: 'accepted', updatedAt: now });

    // ledger entry
    await tx.table('ledger').insert({ type: 'bid_accepted', bidId, amount: bid.amount, createdAt: now });

    // create a claim/hold entry (application-level concept)
    const charge = await tx.table('charges').insert({ reference: generateRef(), amount: bid.amount, status: 'pending', metadata: { bidId } });

    // optionally call an on-chain / external payment hold via an async webhook or server job

    return { ...bid, status: 'accepted' };
  });
}
```

Notes
- Make operations idempotent where appropriate (accept/reject) so retries are safe.
- Keep auth/authorization checks on the server; never rely on the client.
- Use Convex transactions or compare-and-swap patterns to prevent two posters accepting different bids concurrently.

Testing guidance
- Unit-test Convex functions locally with a test database or the dev shim (the repo's `convex.functions.ts` shows a persisted JSON store useful for tests).
- Add integration tests that call the server function and assert ledger + charge creation.

Migration
- Replace references to the local shim in `ConvexService.getClient()` by removing the USE_CONVEX_LOCAL_FUNCTIONS branch and allowing the installed `convex/server` client to handle calls.

*** End of doc
