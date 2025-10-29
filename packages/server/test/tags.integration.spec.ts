import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { describe, it, expect } from 'vitest';

describe('Tags (integration)', () => {
  it('listTags returns unique tags from service', async () => {
    const mockConvex = {
      listGigs: async () => [
        { id: 'g1', title: 'G1', payout: 100, createdAt: new Date().toISOString(), authorId: 'a', tags: ['design', 'react'] },
        { id: 'g2', title: 'G2', payout: 200, createdAt: new Date().toISOString(), authorId: 'b', tags: ['dev'] },
      ],
    } as any;

    const { GigsController } = await import('../src/gigs.controller');
    const controller = new GigsController(mockConvex);
    const tags = await controller.listTags();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags).toEqual(expect.arrayContaining(['design', 'react', 'dev']));
  });
});
