import { Controller, Post, Body, Logger, Get, Param, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { ConvexService } from './convex.service';
import type { CreateBidDTO, UpdateBidDTO } from '../../common/src/types';

@Controller()
export class BidsController {
  private logger = new Logger(BidsController.name);
  constructor(private readonly convex: ConvexService) {
    this.logger.log(`BidsController constructed; convex injected=${!!this.convex}`);
  }

  // Create a bid on a gig
  @Post('gigs/:gigId/bids')
  async create(@Param('gigId') gigId: string, @Body() body: CreateBidDTO & { userId?: string }, @Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    const payload = { gigId, amount: body.amount, message: body.message, userId };
    return this.convex.createBid(payload);
  }

  // List bids for a gig (poster sees all, bidder sees own)
  @Get('gigs/:gigId/bids')
  async list(@Param('gigId') gigId: string, @Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    return this.convex.listBidsByGig(gigId, userId);
  }

  // List bids for the current authenticated user
  @Get('bids/me')
  async myBids(@Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    return this.convex.listBidsByUser(userId);
  }

  // Update a bid (bidder only)
  @Patch('bids/:bidId')
  async update(@Param('bidId') bidId: string, @Body() body: UpdateBidDTO & { userId?: string }, @Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    return this.convex.updateBid({ bidId, amount: body.amount, message: body.message, userId });
  }

  @Post('bids/:bidId/counter')
  async counter(@Param('bidId') bidId: string, @Body() body: { counterAmount: number; message?: string; userId?: string }, @Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    return this.convex.counterBid({ bidId, counterAmount: body.counterAmount, message: body.message, userId });
  }

  @Post('bids/:bidId/accept')
  async accept(@Param('bidId') bidId: string, @Body() body: { userId?: string }, @Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    return this.convex.acceptBid({ bidId, userId });
  }

  @Post('bids/:bidId/reject')
  async reject(@Param('bidId') bidId: string, @Body() body: { userId?: string }, @Req() req: any) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Authentication required');
    return this.convex.rejectBid({ bidId, userId });
  }
}
