import { describe, it, expect } from 'vitest';
import { ConvexService } from '../src/convex.service';
import type { CreateGigDTO } from '../../common/src/types';

describe('ConvexService', () => {
  it('returns a local stub when Convex client is not available', async () => {
    const svc = new ConvexService();
    const payload: CreateGigDTO = {
      title: 'Test Gig',
      description: 'created by test',
      payout: 100,
      location: 'Remote'
    };

    const result = await svc.createGig(payload);
    expect(result).toHaveProperty('id');
    expect(result.title).toBe(payload.title);
    expect(result.id.startsWith('local-')).toBe(true);
  });

  it('returns result from mocked Convex client when set', async () => {
    const svc = new ConvexService();
    // Inject a mocked convex client
    (svc as unknown as Record<string, unknown>).client = {
      mutation: async (name: string, arg?: unknown) => {
        return {
          id: 'convex-1',
          ...(arg as Record<string, unknown>),
          createdAt: new Date().toISOString(),
          authorId: 'convex'
        };
      }
    } as unknown;

    const payload: CreateGigDTO = {
      title: 'Convex Gig',
      payout: 200
    };

    const result = await svc.createGig(payload);
    expect(result.id).toBe('convex-1');
    expect(result.title).toBe(payload.title);
  });
});
