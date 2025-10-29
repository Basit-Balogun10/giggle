// Local Convex-style functions for development.
// This provides a `mutation(name, payload)` function similar to Convex server
// functions. Data is stored in-memory for dev/test purposes.

import type { CreateGigDTO, Gig } from '../../common/src/types';
import type { PaystackChargeData } from '../../common/src/payments';
import * as fs from 'fs';
import * as path from 'path';

type MutationResult = unknown;

const STORE_PATH = path.join(__dirname, '..', '..', 'dev-data.json');

const store: { gigs: Gig[]; ledger: any[]; charges: PaystackChargeData[] } = readStore();

function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(raw) as { gigs: Gig[]; ledger: any[]; charges: PaystackChargeData[] };
    }
  } catch (e) {
    // ignore parse errors and fall through to default
  }
  return { gigs: [], ledger: [], charges: [] };
}

function writeStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    // best-effort only
  }
}

export const localConvex = {
  async mutation(name: string, payload?: unknown): Promise<MutationResult> {
    if (name === 'gigs.create') {
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
        authorId: (p as any).authorId ?? 'dev',
      };
  store.gigs.push(gig);
  writeStore();
  return gig;
    }

    if (name === 'gigs.list') {
      // Optional payload can include simple filters: { tag?: string, minPayout?: number, maxPayout?: number, q?: string }
      const q = (payload as any) || {};
      let out = store.gigs.slice().reverse(); // newest first
      if (q.tag) {
        out = out.filter((g) => (g as any).tags && (g as any).tags.includes(q.tag));
      }
      if (typeof q.minPayout === 'number') {
        out = out.filter((g) => g.payout >= q.minPayout);
      }
      if (typeof q.maxPayout === 'number') {
        out = out.filter((g) => g.payout <= q.maxPayout);
      }
      if (q.q) {
        const needle = String(q.q).toLowerCase();
        out = out.filter((g) => (g.title && g.title.toLowerCase().includes(needle)) || (g.description && g.description.toLowerCase().includes(needle)));
      }
      return out;
    }

    if (name === 'claims.createCharge') {
      const { amount, metadata } = payload as any;
      const charge: PaystackChargeData = {
        reference: `ps_local_${Date.now()}`,
        amount: amount ?? 0,
        status: 'pending',
        metadata: metadata ?? {},
      };
  store.charges.push(charge);
  // also add a ledger entry
  store.ledger.push({ id: `l_${Date.now()}`, type: 'hold', amount: charge.amount, ref: charge.reference, meta: metadata });
  writeStore();
  return charge;
    }

    if (name === 'ledger.record') {
      const entry = payload as any;
  store.ledger.push({ ...entry, id: `l_${Date.now()}` });
  writeStore();
  return store.ledger[store.ledger.length - 1];
    }

    return null;
  },

  // expose store for tests/debugging
  _store: store,
};
