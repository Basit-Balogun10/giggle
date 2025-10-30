# Bidding & Negotiation — Design Doc

Status: In-progress

Goal
----
Design a minimal, secure, and testable bidding and negotiation system for Giggle that supports:
- Private bids from students to gig posters
- Bid updates and counter-offers
- Acceptance/rejection by the poster
- Clear visibility rules: bids visible only to bidder and poster until accepted

Constraints and assumptions
---------------------------
- Use Convex for production data store and server-side functions; during local dev use `convex.functions` local shim.
- Keep API surface minimal for MVP: a few HTTP endpoints plus Convex functions for server-side enforcement.
- Authentication is required for bid actions (assume `userId` is available via auth middleware/session). For now, design APIs assuming authenticated `userId` is passed in request context; implementation will wire Convex auth later.

Data model
----------
- Bid
  - id: string (UUID or Convex id)
  - gigId: string
  - bidderId: string
  - amount: number (in kobo)
  - message?: string
  - status: 'pending' | 'countered' | 'accepted' | 'rejected'
  - counterAmount?: number
  - createdAt: ISO timestamp
  - updatedAt: ISO timestamp

- Indexing & queries
  - queries: bids.byGig(gigId) -> only returns bids visible to the caller (poster sees all, bidder sees own)

Server-side rules (Convex functions / HTTP middleware)
---------------------------------------------------
- createBid(gigId, amount, message):
  - Validate gig exists and is open
  - Create Bid with status 'pending'
  - Only bidderId = current user

- updateBid(bidId, amount, message):
  - Only bidder can update while status is pending/countered
  - Update amount/message and updatedAt

- counterBid(bidId, counterAmount, message):
  - Only poster can counter a bid made on their gig
  - Set status='countered', set counterAmount, notify bidder

- acceptBid(bidId):
  - Only poster can accept
  - Set status='accepted'
  - Trigger ledger hold/escrow logic via existing claims/payments flow (future integration)

- rejectBid(bidId):
  - Only poster can reject
  - Set status='rejected'

API endpoints (HTTP)
--------------------
- POST /api/gigs/:gigId/bids — create a bid
  - body: { amount, message }
  - auth required
  - returns 201 + bid

- GET /api/gigs/:gigId/bids — list bids for gig
  - for poster: return all bids
  - for bidder: return only their bids
  - for others: return empty or limited public info (MVP: none)

- PATCH /api/bids/:bidId — update amount/message (bidder only)
  - body: { amount?, message? }

- POST /api/bids/:bidId/counter — poster counter-offer
  - body: { counterAmount, message? }

- POST /api/bids/:bidId/accept — poster accepts
  - triggers payment hold via claims flow (future)

- POST /api/bids/:bidId/reject — poster rejects

UI flows (mobile)
-----------------
- Place bid: on gig details screen, open bid modal with amount + optional message. On submit, optimistic UI adds temporary bid and calls POST.
- View bids (poster): list bids with amounts/messages and actions: counter / accept / reject. Counter opens small modal, accept confirms.
- View bids (bidder): list own bids and status; allow update while pending.

Security and privacy
--------------------
- Enforce server-side authorization checks in Convex functions and HTTP endpoints. Never trust client-side checks.
- Bids are private until accepted. Only the poster and the bidder should ever receive full bid payloads.

Edge cases
----------
- Concurrent counters/accepts: use Convex functions transactionally to avoid race conditions.
- Large number of bids: paginate bids.byGig results and index by gigId.
- Bid updates after acceptance: disallowed.

Testing
-------
- Unit tests for Convex functions: createBid, updateBid, counterBid, acceptBid, rejectBid.
- Integration tests for HTTP endpoints using Nest testing module: mock auth context, assert authorization rules.
- E2E smoke: create gig -> place bid as student -> sign-in as poster (or mock) -> accept bid -> assert ledger entry created (integration with claims shim).

Next implementation tasks (short-term)
------------------------------------
1. Add Convex schema for Bid and functions: bids.create, bids.update, bids.listByGig, bids.counter, bids.accept, bids.reject.
2. Add server-side controllers + endpoints to call Convex functions with auth enforcement.
3. Mobile UI: bid modal, bidder list, poster actions.
4. Tests: unit + integration as described.

Notes
-----
This design intentionally keeps payment integration decoupled: bid acceptance should trigger existing claims/payments flow rather than directly moving money in this first iteration.
