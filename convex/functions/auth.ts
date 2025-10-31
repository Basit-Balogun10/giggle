import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Thin Convex function wrappers for Convex Auth server helpers.
// These call into @convex-dev/auth/server when available and expose
// small mutations/queries for the mobile app to use if needed.

export const sendOtp = mutation({
  args: { identifier: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      // Defer require to runtime so environments without the package don't fail build.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { convexAuth } = require('@convex-dev/auth/server');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ResendOTP } = require('../ResendOTP');
      const providers: any[] = [];
      if (ResendOTP) providers.push(ResendOTP);
      const s = convexAuth({ providers });
      if (typeof s.signIn === 'function') {
        return await s.signIn({ identifier: args.identifier });
      }
      throw new Error('Auth signIn not available');
    } catch (err: any) {
      throw new Error(`Auth provider not configured: ${String(err?.message ?? err)}`);
    }
  },
});

export const verify = mutation({
  args: { token: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { convexAuth } = require('@convex-dev/auth/server');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ResendOTP } = require('../ResendOTP');
      const providers: any[] = [];
      if (ResendOTP) providers.push(ResendOTP);
      const s = convexAuth({ providers });
      if (typeof s.verify === 'function') {
        return await s.verify(args.token);
      }
      if (s.auth && typeof s.auth.verify === 'function') {
        return await s.auth.verify(args.token);
      }
      throw new Error('Auth verify not available');
    } catch (err: any) {
      throw new Error(`Auth provider not configured: ${String(err?.message ?? err)}`);
    }
  },
});
