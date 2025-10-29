import { describe, it, expect, beforeEach } from 'vitest';
import { ConvexService } from '../src/convex.service';

describe('Convex dev shim', () => {
  beforeEach(() => {
    process.env.USE_CONVEX_DEV_SHIM = '1';
  });

  it('uses dev shim to create a gig', async () => {
    const svc = new ConvexService();
    const res = await svc.createGig({ title: 'DevShim Gig', payout: 50 } as any);
    expect(res).toHaveProperty('id');
    expect(res.title).toBe('DevShim Gig');
  });
});
