import { Controller, Post, Body, Logger, Get, Query } from '@nestjs/common';
import { ConvexService } from './convex.service';
import type { CreateGigDTO, Gig } from '../../common/src/types';

@Controller('gigs')
export class GigsController {
  private logger = new Logger(GigsController.name);
  constructor(private readonly convex: ConvexService) {
    this.logger.log(`GigsController constructed; convex injected=${!!this.convex}`);
  }

  @Get()
  async list(
    @Query('tag') tag?: string,
    @Query('min') min?: string,
    @Query('max') max?: string,
    @Query('q') q?: string,
  ) {
    const filters: any = {};
    if (tag) filters.tag = tag;
    if (min) filters.minPayout = Number(min);
    if (max) filters.maxPayout = Number(max);
    if (q) filters.q = q;
    return this.convex.listGigs(filters);
  }

  @Get('tags')
  async listTags() {
    if (!this.convex || typeof (this.convex as any).listGigs !== 'function') {
      throw new Error('ConvexService not available. Ensure ConvexService is provided and Convex is configured.');
    }
    const gigs = await (this.convex as any).listGigs();
    const tagSet = new Set<string>();
    for (const g of gigs) {
      const tags = (g as any).tags as string[] | undefined;
      if (Array.isArray(tags)) tags.forEach((t) => tagSet.add(t));
    }
    return Array.from(tagSet).sort();
  }

  @Post()
  async create(@Body() payload: CreateGigDTO): Promise<Gig> {
    try {
      // Use injected ConvexService instance (no runtime fallback here for production).
      if (!this.convex) throw new Error('ConvexService not injected');
      const result = await this.convex.createGig(payload);
      return result;
    } catch (err) {
      this.logger.error('Error creating gig', err as Error);
      throw err;
    }
  }
}
