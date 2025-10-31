// Convex placeholder service - wire up the Convex JS/TS client here
// When ready, add `convex` package to server via pnpm and initialize the client with server-side key

import { Injectable, Logger } from '@nestjs/common';
import type { CreateGigDTO, Gig, Bid, CreateBidDTO, UpdateBidDTO } from '../../common/src/types';

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
      // Dynamically require Convex server client. The import shape may vary across
      // Convex versions — prefer the official server export.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const convex = require('convex/server') as unknown;
      if (convex && typeof (convex as any).mutation === 'function') {
        this.client = convex as ConvexLike;
        this.logger.log('Convex client loaded');
        return this.client;
      }
      if ((convex as any).default && typeof (convex as any).default.mutation === 'function') {
        this.client = (convex as any).default as ConvexLike;
        this.logger.log('Convex client loaded (default export)');
        return this.client;
      }
      this.logger.error('Convex package found but mutation API not detected');
      this.client = null;
      return null;
    } catch (err) {
      this.logger.error('Convex package not installed; Convex is required for server operation');
      this.client = null;
      return null;
    }
  }

  async createGig(payload: CreateGigDTO): Promise<Gig> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('gigs.create', payload);
      return result as unknown as Gig;
    }
    throw new Error('Convex client not available. Install and configure Convex on the server.');
  }

  async listGigs(filters?: { tag?: string; minPayout?: number; maxPayout?: number; q?: string }): Promise<Gig[]> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('gigs.list', filters || {});
      return (result as unknown) as Gig[];
    }
    throw new Error('Convex client not available. Install and configure Convex on the server.');
  }

  // Bids
  async createBid(payload: CreateBidDTO & { userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.create', payload);
      return result as unknown as Bid;
    }
    throw new Error('Convex client not available');
  }

  async updateBid(payload: { bidId: string; amount?: number; message?: string; userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.update', payload);
      return result as unknown as Bid;
    }
    throw new Error('Convex client not available');
  }

  async listBidsByGig(gigId: string, userId?: string): Promise<Bid[]> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.listByGig', { gigId, userId });
      return result as unknown as Bid[];
    }
    return [];
  }

  async listBidsByUser(userId?: string): Promise<Bid[]> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.listByUser', { userId });
      return result as unknown as Bid[];
    }
    return [];
  }

  async counterBid(payload: { bidId: string; counterAmount: number; message?: string; userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.counter', payload);
      return result as unknown as Bid;
    }
    throw new Error('Convex client not available');
  }

  async acceptBid(payload: { bidId: string; userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.accept', payload);
      return result as unknown as Bid;
    }
    throw new Error('Convex client not available');
  }

  async rejectBid(payload: { bidId: string; userId?: string }): Promise<Bid> {
    const client = this.getClient();
    if (client && typeof client.mutation === 'function') {
      const result = await client.mutation('bids.reject', payload);
      return result as unknown as Bid;
    }
    throw new Error('Convex client not available');
  }
}
