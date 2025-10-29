import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PaystackController } from '../src/paystack.controller';
import * as crypto from 'crypto';

describe('PaystackController', () => {
  const originalEnv = { ...process.env };
  let controller: PaystackController;

  beforeEach(() => {
    controller = new PaystackController();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('accepts a valid signature', async () => {
    process.env.PAYSTACK_SECRET = 'test_secret';
    const payload = { event: 'charge.success', data: { reference: 'r1', amount: 500 } };
    const raw = Buffer.from(JSON.stringify(payload), 'utf8');
    const sig = crypto.createHmac('sha512', 'test_secret').update(raw).digest('hex');

    const res = await controller.webhook({ rawBody: raw } as any, sig, payload as any);
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('ok');
  });

  it('rejects an invalid signature', async () => {
    process.env.PAYSTACK_SECRET = 'test_secret';
    const payload = { event: 'charge.success', data: { reference: 'r1', amount: 500 } };
    const raw = Buffer.from(JSON.stringify(payload), 'utf8');
    const badSig = 'deadbeef';

    const res = await controller.webhook({ rawBody: raw } as any, badSig, payload as any);
    expect(res).toHaveProperty('status');
    expect(res.status).toBe('error');
  });
});
