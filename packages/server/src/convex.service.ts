// Convex placeholder service - wire up the Convex JS/TS client here
// When ready, add `convex` package to server via pnpm and initialize the client with server-side key

import { Injectable, Logger } from "@nestjs/common";
import type {
  CreateGigDTO,
  Gig,
  Bid,
  CreateBidDTO,
  UpdateBidDTO,
} from "../../common/src/types";

import { devConvex } from './convex.dev';
import { localConvex } from './convex.functions';
// Try to import Convex server client statically — package should be installed in workspace
import convexServer from 'convex/server';

type ConvexLike = {
  mutation?: (name: string, payload?: unknown) => Promise<unknown>;
};

/**
 * ConvexService — attempts to call a Convex mutation if the Convex server client is
 * available. Avoids using `any` by typing the client as ConvexLike and casting results
 * to the shared `Gig` type only after the mutation returns.
 */
@Injectable()
export class ConvexService {
  private logger = new Logger(ConvexService.name);
  private client: ConvexLike | null = null;

  private getClient(): ConvexLike | null {
    if (this.client) return this.client;
    try {
      // Support a developer-friendly local shim: set USE_CONVEX_DEV_SHIM=1 to use
      // the in-repo dev shim which provides a `mutation` function for common cases
      // like `gigs.create` without needing a real Convex deployment.
      if (process.env.USE_CONVEX_DEV_SHIM === '1') {
        this.client = devConvex as unknown as ConvexLike;
        this.logger.log('Using Convex dev shim (USE_CONVEX_DEV_SHIM=1)');
        return this.client;
      }

      // Support an alternative local functions module that behaves like Convex
      // server functions. Enable with USE_CONVEX_LOCAL_FUNCTIONS=1 during dev.
      if (process.env.USE_CONVEX_LOCAL_FUNCTIONS === '1') {
        this.client = localConvex as unknown as ConvexLike;
        this.logger.log('Using local Convex functions (USE_CONVEX_LOCAL_FUNCTIONS=1)');
        return this.client;
      }

      // Use statically imported convex server client if it exposes mutation
      if (convexServer && typeof (convexServer as any).mutation === 'function') {
        this.client = convexServer as ConvexLike;
        this.logger.log('Convex client loaded');
        return this.client;
      }

      // Some Convex versions export a default with mutation
      if ((convexServer as any).default && typeof (convexServer as any).default.mutation === 'function') {
        this.client = (convexServer as any).default as ConvexLike;
        this.logger.log('Convex client loaded (default export)');
        return this.client;
      }

      this.logger.warn('Convex package found but mutation API not detected');
      this.client = null;
      return null;
    } catch (err) {
      this.logger.error(
        "Convex package not installed; Convex is required for server operation"
      );
      this.client = null;
      return null;
    }
  }

  async createGig(payload: CreateGigDTO): Promise<Gig> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("gigs.create", payload);
      return result as unknown as Gig;
    }
    throw new Error(
      "Convex client not available. Install and configure Convex on the server."
    );
  }

  async listGigs(filters?: {
    tag?: string;
    minPayout?: number;
    maxPayout?: number;
    q?: string;
  }): Promise<Gig[]> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("gigs.list", filters || {});
      return result as unknown as Gig[];
    }
    throw new Error(
      "Convex client not available. Install and configure Convex on the server."
    );
  }

  // Bids
  async createBid(payload: CreateBidDTO & { userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.create", payload);
      return result as unknown as Bid;
    }
    throw new Error("Convex client not available");
  }

  async updateBid(payload: {
    bidId: string;
    amount?: number;
    message?: string;
    userId?: string;
  }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.update", payload);
      return result as unknown as Bid;
    }
    throw new Error("Convex client not available");
  }

  async listBidsByGig(gigId: string, userId?: string): Promise<Bid[]> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.listByGig", { gigId, userId });
      return result as unknown as Bid[];
    }
    return [];
  }

  async listBidsByUser(userId?: string): Promise<Bid[]> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.listByUser", { userId });
      return result as unknown as Bid[];
    }
    return [];
  }

  async counterBid(payload: {
    bidId: string;
    counterAmount: number;
    message?: string;
    userId?: string;
  }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.counter", payload);
      return result as unknown as Bid;
    }
    throw new Error("Convex client not available");
  }

  async acceptBid(payload: { bidId: string; userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.accept", payload);
      return result as unknown as Bid;
    }
    throw new Error("Convex client not available");
  }

  async rejectBid(payload: { bidId: string; userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === "function") {
      const result = await client.mutation("bids.reject", payload);
      return result as unknown as Bid;
    }
    throw new Error("Convex client not available");
  }
}
