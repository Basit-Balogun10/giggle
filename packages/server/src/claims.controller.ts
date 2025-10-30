import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Public } from './public.decorator';
import { ClaimsService } from './claims.service';
import type { ClaimGigDTO } from '../../common/src/types';
import type { PaystackChargeData } from '../../common/src/payments';

@Controller('claims')
export class ClaimsController {
  constructor(@Inject('ClaimsService') private readonly claimsService: ClaimsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: ClaimGigDTO): Promise<PaystackChargeData> {
    // For now, treat payout as the charge amount; in a real flow we'd lookup the gig
    // to determine the correct amount and currency handling.
    const amount = (payload as any).amount ?? 0;
    const metadata = { gigId: payload.gigId, claimant: payload.userId } as Record<string, unknown>;
    const charge = await this.claimsService.createCharge(amount, metadata);
    return charge;
  }
}
