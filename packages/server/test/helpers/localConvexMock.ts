import type {
  CreateGigDTO,
  Gig,
  Bid,
  CreateBidDTO,
} from "../../../../common/src/types";

type MutationResult = unknown;

const store: { gigs: Gig[]; ledger: any[]; charges: any[]; bids: Bid[] } = {
  gigs: [],
  ledger: [],
  charges: [],
  bids: [],
};

function nowIso() {
  return new Date().toISOString();
}

export const localConvexMock: any = {
  async mutation(name: string, payload?: unknown): Promise<MutationResult> {
    // gigs.create
    if (name === "gigs.create") {
      const p = payload as CreateGigDTO & any;
      const gig: Gig = {
        id: `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: p.title,
        description: p.description ?? undefined,
        payout: p.payout ?? 0,
        location: p.location ?? undefined,
        tags: (p as any).tags ?? undefined,
        createdAt: nowIso(),
        authorId: (p as any).authorId ?? "dev",
      } as any;
      store.gigs.push(gig);
      return gig;
    }

    if (name === "gigs.list") {
      const q = (payload as any) || {};
      let out = store.gigs.slice().reverse();
      if (q.tag)
        out = out.filter(
          (g) =>
            Array.isArray((g as any).tags) && (g as any).tags.includes(q.tag)
        );
      if (typeof q.minPayout === "number")
        out = out.filter((g) => g.payout >= q.minPayout);
      if (typeof q.maxPayout === "number")
        out = out.filter((g) => g.payout <= q.maxPayout);
      if (q.q) {
        const needle = String(q.q).toLowerCase();
        out = out.filter(
          (g) =>
            (g.title && g.title.toLowerCase().includes(needle)) ||
            (g.description && g.description.toLowerCase().includes(needle))
        );
      }
      return out;
    }

    // Bids
    if (name === "bids.create") {
      const p = payload as CreateBidDTO & { userId?: string };
      if (!p.userId) throw new Error("unauthenticated");
      const gig = store.gigs.find((g) => g.id === p.gigId);
      if (!gig) throw new Error("gig not found");
      const bid: Bid = {
        id: `bid_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        gigId: p.gigId,
        bidderId: p.userId!,
        amount: p.amount,
        message: p.message ?? undefined,
        status: "pending",
        counterAmount: undefined,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      } as any;
      store.bids.push(bid);
      return bid;
    }

    if (name === "bids.update") {
      const p = payload as any;
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      if (bid.bidderId !== p.userId) throw new Error("not authorized");
      if (bid.status === "accepted" || bid.status === "rejected")
        throw new Error("cannot update finalized bid");
      if (typeof p.amount === "number") bid.amount = p.amount;
      if (typeof p.message === "string") bid.message = p.message;
      bid.updatedAt = nowIso();
      return bid;
    }

    if (name === "bids.listByGig") {
      const p = payload as any;
      const gig = store.gigs.find((g) => g.id === p.gigId);
      if (!gig) return [];
      if (p.userId && p.userId === (gig as any).authorId) {
        return store.bids
          .filter((b) => b.gigId === p.gigId)
          .slice()
          .reverse();
      }
      if (p.userId)
        return store.bids
          .filter((b) => b.gigId === p.gigId && b.bidderId === p.userId)
          .slice()
          .reverse();
      return [];
    }

    if (name === "bids.listByUser") {
      const p = payload as any;
      if (!p.userId) return [];
      return store.bids
        .filter((b) => b.bidderId === p.userId)
        .slice()
        .reverse();
    }

    if (name === "bids.counter") {
      const p = payload as any;
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      const gig = store.gigs.find((g) => g.id === bid.gigId);
      if (!gig) throw new Error("gig not found");
      if ((gig as any).authorId !== p.userId) throw new Error("not authorized");
      bid.status = "countered";
      bid.counterAmount = p.counterAmount;
      if (typeof p.message === "string") bid.message = p.message;
      bid.updatedAt = nowIso();
      return bid;
    }

    if (name === "bids.accept") {
      const p = payload as any;
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      const gig = store.gigs.find((g) => g.id === bid.gigId);
      if (!gig) throw new Error("gig not found");
      if ((gig as any).authorId !== p.userId) throw new Error("not authorized");
      bid.status = "accepted";
      bid.updatedAt = nowIso();
      store.ledger.push({
        id: `l_${Date.now()}`,
        type: "bid_accepted",
        bidId: bid.id,
        amount: bid.amount,
        meta: {},
      });
      const charge = {
        reference: `ps_local_${Date.now()}`,
        amount: bid.amount,
        status: "pending",
        metadata: { bidId: bid.id, gigId: bid.gigId },
      } as any;
      store.charges.push(charge);
      store.ledger.push({
        id: `l_${Date.now()}_hold`,
        type: "hold",
        amount: charge.amount,
        ref: charge.reference,
        meta: { bidId: bid.id },
      });
      return bid;
    }

    if (name === "bids.reject") {
      const p = payload as any;
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      const gig = store.gigs.find((g) => g.id === bid.gigId);
      if (!gig) throw new Error("gig not found");
      if ((gig as any).authorId !== p.userId) throw new Error("not authorized");
      bid.status = "rejected";
      bid.updatedAt = nowIso();
      return bid;
    }

    if (name === "claims.createCharge") {
      const { amount, metadata } = payload as any;
      const charge = {
        reference: `ps_local_${Date.now()}`,
        amount: amount ?? 0,
        status: "pending",
        metadata: metadata ?? {},
      } as any;
      store.charges.push(charge);
      store.ledger.push({
        id: `l_${Date.now()}`,
        type: "hold",
        amount: charge.amount,
        ref: charge.reference,
        meta: metadata,
      });
      return charge;
    }

    if (name === "ledger.record") {
      const entry = payload as any;
      const e = { ...entry, id: `l_${Date.now()}` };
      store.ledger.push(e);
      return e;
    }

    return null;
  },

  _store: store,
};

export default localConvexMock;
