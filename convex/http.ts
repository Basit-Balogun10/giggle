import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

const http = httpRouter();

// Paystack webhook endpoint. Verifies signature and forwards to internal mutations.
http.route({
  path: '/paystack/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    // Read raw bytes (recommended so signature matches exactly)
    const raw = await req.bytes();
    // Parse JSON
    let parsed: any;
    try {
      const text = new TextDecoder().decode(raw);
      parsed = JSON.parse(text);
    } catch (err) {
      return new Response(JSON.stringify({ status: 'error', message: 'invalid json' }), { status: 400 });
    }

    // Validate signature if configured
    const secret = (globalThis as any).process?.env?.PAYSTACK_SECRET ?? undefined;
    if (secret) {
      try {
        // compute hmac sha512
        // Use SubtleCrypto if available in runtime, otherwise fallback to Node's crypto via global
        let computed = '';
        if ((globalThis as any).crypto && (globalThis as any).crypto.subtle) {
          const key = await (globalThis as any).crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
          const sig = await (globalThis as any).crypto.subtle.sign('HMAC', key, raw);
          computed = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
        } else {
          // Node environment
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const crypto = require('crypto');
          computed = crypto.createHmac('sha512', secret).update(raw).digest('hex');
        }

        const signature = (req.headers.get && req.headers.get('x-paystack-signature')) || (req.headers && (req.headers as any)['x-paystack-signature']);
        if (!signature) {
          return new Response(JSON.stringify({ status: 'error', message: 'missing signature' }), { status: 400 });
        }
        // timing-safe compare
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const crypto = require('crypto');
        const ok = crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
        if (!ok) return new Response(JSON.stringify({ status: 'error', message: 'invalid signature' }), { status: 403 });
      } catch (err) {
        return new Response(JSON.stringify({ status: 'error', message: 'signature validation failed' }), { status: 500 });
      }
    }

    // Handle the Paystack event. For a charge.success example, mark charge and ledger.
    const event = parsed?.event;
    switch (event) {
      case 'charge.success': {
        // Example: update the charge record status and write a ledger entry via internal mutations
        const reference = parsed?.data?.reference;
        if (!reference) return new Response(JSON.stringify({ status: 'error', message: 'missing reference' }), { status: 400 });
        // Update charge status by searching for charge by reference (simple table scan)
        // We'll call an internal mutation to record ledger; find the charge via a query is not available here so
        // instead create a ledger entry and rely on an external reconciliation job to update charge records.
        await ctx.runMutation(internal.functions.ledger.recordLedgerEntry, { type: 'paystack.charge.success', amount: parsed?.data?.amount ?? 0, meta: { reference: reference } });
        return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
      }
      default:
        return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    }
  }),
});

// Health endpoint
http.route({
  path: '/health',
  method: 'GET',
  handler: httpAction(async (ctx, req) => {
    return new Response(JSON.stringify({ status: 'ok', service: 'convex', timestamp: Date.now() }), { status: 200 });
  }),
});

export default http;
