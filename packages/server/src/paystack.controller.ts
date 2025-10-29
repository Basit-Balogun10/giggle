import { Controller, Post, Headers, Body, HttpCode, HttpStatus, Req, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { PaystackWebhookEvent, PaystackSignature } from '../../common/src/payments';

@Controller('paystack')
export class PaystackController {
  private logger = new Logger(PaystackController.name);

  constructor() {}

  // Paystack sends raw JSON; to validate signature correctly you should capture the raw
  // body bytes (see README) and attach them to `req.rawBody`. This handler will use
  // `req.rawBody` when present, otherwise falls back to serializing the parsed body.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: Request,
    @Headers('x-paystack-signature') signature: PaystackSignature | undefined,
    @Body() body: PaystackWebhookEvent
  ) {
    const secret = process.env.PAYSTACK_SECRET;
    if (!secret) {
      // No secret configured — reject for safety
      return { status: 'error', message: 'Paystack secret not configured' };
    }

    // Use rawBody when available (recommended). Fallback to JSON stringification which
    // may not always match the exact bytes Paystack signed.
    const raw = (req as any).rawBody ?? Buffer.from(JSON.stringify(body));
    const computed = crypto.createHmac('sha512', secret).update(raw).digest('hex');

    if (!signature) {
      this.logger.warn('Missing Paystack signature header');
      return { status: 'error', message: 'missing signature' };
    }

    try {
      if (!crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))) {
        this.logger.warn('Invalid Paystack signature');
        return { status: 'error', message: 'invalid signature' };
      }
    } catch (err) {
      // timingSafeEqual will throw if buffers lengths differ — treat as invalid
      this.logger.warn('Paystack signature validation error', err as Error);
      return { status: 'error', message: 'invalid signature' };
    }

    // Basic event handling example
    const event = body?.event;

    switch (event) {
      case 'charge.success':
        this.logger.log('Received charge.success from Paystack');
        // TODO: verify charge, update Convex DB, release escrow, notify users
        return { status: 'ok' };
      default:
        return { status: 'ok' };
    }
  }
}
