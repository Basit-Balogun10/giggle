// Local Convex-style functions for development.
// This provides a `mutation(name, payload)` function similar to Convex server
// functions. Data is stored in-memory for dev/test purposes.

import type {
  CreateGigDTO,
  Gig,
  Bid,
  CreateBidDTO,
  UpdateBidDTO,
} from "../../common/src/types";
import type { PaystackChargeData } from "../../common/src/payments";
import * as fs from "fs";
import * as path from "path";

type MutationResult = unknown;

const STORE_PATH = path.join(__dirname, "..", "..", "dev-data.json");

const store: {
  gigs: Gig[];
  ledger: any[];
  charges: PaystackChargeData[];
  bids: Bid[];
} = readStore();

function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      // dev-data.json may or may not include bids; ensure we return a complete shape
      const parsed = JSON.parse(raw) as { gigs?: Gig[]; ledger?: any[]; charges?: PaystackChargeData[]; bids?: Bid[] };
      return {
        gigs: parsed.gigs ?? [],
        ledger: parsed.ledger ?? [],
        charges: parsed.charges ?? [],
        bids: parsed.bids ?? [],
      };
    }
  } catch (e) {
    // ignore parse errors and fall through to default
  }
  return { gigs: [], ledger: [], charges: [], bids: [] };
}

function writeStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (e) {
    // best-effort only
  }
}

export const localConvex = {
  async mutation(name: string, payload?: unknown): Promise<MutationResult> {
    if (name === "gigs.create") {
      const p = payload as CreateGigDTO;
      const gig: Gig = {
        id: `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: p.title,
        // keep undefined when not provided to match the shared type
        description: p.description ?? undefined,
        payout: p.payout ?? 0,
        location: p.location ?? undefined,
        tags: (p as any).tags ?? undefined,
        createdAt: new Date().toISOString(),
        authorId: (p as any).authorId ?? "dev",
      };
      store.gigs.push(gig);
      writeStore();
      return gig;
    }

    if (name === "gigs.list") {
      // Optional payload can include simple filters: { tag?: string, minPayout?: number, maxPayout?: number, q?: string }
      const q = (payload as any) || {};
      let out = store.gigs.slice().reverse(); // newest first
      if (q.tag) {
        out = out.filter(
          (g) => (g as any).tags && (g as any).tags.includes(q.tag)
        );
      }
      if (typeof q.minPayout === "number") {
        out = out.filter((g) => g.payout >= q.minPayout);
      }
      if (typeof q.maxPayout === "number") {
        out = out.filter((g) => g.payout <= q.maxPayout);
      }
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
      // payload: CreateBidDTO & { userId }
      const p = payload as CreateBidDTO & { userId?: string };
      if (!p.userId) throw new Error("unauthenticated");
      const gig = store.gigs.find((g) => g.id === p.gigId);
      if (!gig) throw new Error("gig not found");
      const bid: Bid = {
        id: `bid_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        gigId: p.gigId,
        bidderId: p.userId,
        amount: p.amount,
        message: p.message ?? undefined,
        status: "pending",
        counterAmount: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.bids.push(bid);
      writeStore();
      return bid;
    }

    if (name === "bids.update") {
      // payload: { bidId, amount?, message?, userId }
      const p = payload as {
        bidId: string;
        amount?: number;
        message?: string;
        userId?: string;
      };
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      if (bid.bidderId !== p.userId) throw new Error("not authorized");
      if (bid.status === "accepted" || bid.status === "rejected")
        throw new Error("cannot update finalized bid");
      if (typeof p.amount === "number") bid.amount = p.amount;
      if (typeof p.message === "string") bid.message = p.message;
      bid.updatedAt = new Date().toISOString();
      writeStore();
      return bid;
    }

    if (name === "bids.listByGig") {
      // payload: { gigId, userId }
      const p = payload as { gigId: string; userId?: string };
      const gig = store.gigs.find((g) => g.id === p.gigId);
      if (!gig) return [];
      if (p.userId && p.userId === (gig as any).authorId) {
        // poster: see all bids
        return store.bids
          .filter((b) => b.gigId === p.gigId)
          .slice()
          .reverse();
      }
      if (p.userId) {
        // bidder: see own bids
        return store.bids
          .filter((b) => b.gigId === p.gigId && b.bidderId === p.userId)
          .slice()
          .reverse();
      }
      // unauthenticated or other user: empty list
      return [];
    }

    if (name === "bids.listByUser") {
      // payload: { userId }
      const p = payload as { userId?: string };
      if (!p.userId) return [];
      return store.bids
        .filter((b) => b.bidderId === p.userId)
        .slice()
        .reverse();
    }

    if (name === "bids.counter") {
      // payload: { bidId, counterAmount, message?, userId }
      const p = payload as {
        bidId: string;
        counterAmount: number;
        message?: string;
        userId?: string;
      };
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      const gig = store.gigs.find((g) => g.id === bid.gigId);
      if (!gig) throw new Error("gig not found");
      if ((gig as any).authorId !== p.userId) throw new Error("not authorized");
      bid.status = "countered";
      bid.counterAmount = p.counterAmount;
      if (typeof p.message === "string") bid.message = p.message;
      bid.updatedAt = new Date().toISOString();
      writeStore();
      return bid;
    }

    if (name === "bids.accept") {
      // payload: { bidId, userId }
      const p = payload as { bidId: string; userId?: string };
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      const gig = store.gigs.find((g) => g.id === bid.gigId);
      if (!gig) throw new Error("gig not found");
      if ((gig as any).authorId !== p.userId) throw new Error("not authorized");
      bid.status = "accepted";
      bid.updatedAt = new Date().toISOString();
      // add ledger entry placeholder to indicate acceptance
      const ledgerEntry = {
        id: `l_${Date.now()}`,
        type: "bid_accepted",
        bidId: bid.id,
        amount: bid.amount,
        meta: {},
      };
      store.ledger.push(ledgerEntry);
      // also create a pending charge/claim (simulate calling claims.createCharge)
      const charge = {
        reference: `ps_local_${Date.now()}`,
        amount: bid.amount,
        status: "pending",
        metadata: { bidId: bid.id, gigId: bid.gigId },
      } as any;
      store.charges.push(charge);
      // record a hold ledger entry to mirror claims.createCharge behavior
      store.ledger.push({
        id: `l_${Date.now()}_hold`,
        type: "hold",
        amount: charge.amount,
        ref: charge.reference,
        meta: { bidId: bid.id },
      });
      writeStore();
      return bid;
    }

    if (name === "bids.reject") {
      // payload: { bidId, userId }
      const p = payload as { bidId: string; userId?: string };
      if (!p.userId) throw new Error("unauthenticated");
      const bid = store.bids.find((b) => b.id === p.bidId);
      if (!bid) throw new Error("bid not found");
      const gig = store.gigs.find((g) => g.id === bid.gigId);
      if (!gig) throw new Error("gig not found");
      if ((gig as any).authorId !== p.userId) throw new Error("not authorized");
      bid.status = "rejected";
      bid.updatedAt = new Date().toISOString();
      writeStore();
      return bid;
    }

    if (name === "claims.createCharge") {
      const { amount, metadata } = payload as any;
      const charge: PaystackChargeData = {
        reference: `ps_local_${Date.now()}`,
        amount: amount ?? 0,
        status: "pending",
        metadata: metadata ?? {},
      };
      store.charges.push(charge);
      // also add a ledger entry
      store.ledger.push({
        id: `l_${Date.now()}`,
        type: "hold",
        amount: charge.amount,
        ref: charge.reference,
        meta: metadata,
      });
      writeStore();
      return charge;
    }

    if (name === "ledger.record") {
      const entry = payload as any;
      store.ledger.push({ ...entry, id: `l_${Date.now()}` });
      writeStore();
      return store.ledger[store.ledger.length - 1];
    }

    return null;
  },

  // localConvex shim is intentionally removed — projects should call Convex
  // functions via a deployed Convex instance. If you encounter code that
  // still imports/uses `localConvex`, update it to call Convex directly.
  _store: undefined as any,
};
