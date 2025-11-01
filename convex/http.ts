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
        // timing-safe compare (avoid using the global `Buffer` name which may
        // not be declared in some environments). Convert hex strings to
        // Uint8Array and use Node's crypto.timingSafeEqual when available.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const crypto = require('crypto');
        const hexToUint8 = (h: string) => {
          if (!h) return new Uint8Array(0);
          if (h.startsWith('0x')) h = h.slice(2);
          const arr = new Uint8Array(Math.ceil(h.length / 2));
          for (let i = 0; i < h.length; i += 2) {
            arr[i / 2] = parseInt(h.substr(i, 2), 16) || 0;
          }
          return arr;
        };
        const a = hexToUint8(computed);
        const b = hexToUint8(signature as string);
        let ok = false;
        try {
          if (typeof crypto.timingSafeEqual === 'function' && a.length === b.length) {
            // cast to any to satisfy typing when running in different runtimes
            ok = (crypto.timingSafeEqual as any)(a, b);
          } else {
            // fallback constant-time compare
            if (a.length !== b.length) ok = false;
            else {
              let diff = 0;
              for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
              ok = diff === 0;
            }
          }
        } catch (e) {
          ok = false;
        }
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
        // Update charge status by calling internal helper which will update the charge and record ledger entries.
        try {
          await ctx.runMutation(internal.functions.charges?.markChargeByReference as any, { reference, status: 'success', payload: parsed?.data ?? {} } as any);
        } catch (e) {
          // Fallback: if helper isn't available, write a ledger entry so accounting isn't lost.
          await ctx.runMutation(internal.functions.ledger.recordLedgerEntry as any, { type: 'paystack.charge.success', amount: parsed?.data?.amount ?? 0, meta: { reference } as any, createdAt: Date.now() } as any);
        }
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
