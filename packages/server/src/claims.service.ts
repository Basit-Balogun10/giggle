import { Injectable, Logger } from '@nestjs/common';
import type { PaystackChargeData } from '../../common/src/payments';

@Injectable()
export class ClaimsService {
  private logger = new Logger(ClaimsService.name);

  // Create a placeholder Paystack charge object. In production this will call
  // Paystack's API to create a charge/transaction and return the reference and status.
  async createCharge(amount: number, metadata?: Record<string, unknown>): Promise<PaystackChargeData> {
    const reference = `ps_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const charge: PaystackChargeData = {
      reference,
      amount,
      status: 'pending',
      metadata,
    };
    this.logger.log(`Created mock charge ${reference} amount=${amount}`);
    return charge;
  }
}
