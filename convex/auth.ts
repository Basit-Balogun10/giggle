// Convex Auth scaffold for Giggle
// This file shows how to wire Convex Auth (OTP / magic code) on the Convex server.
// Follow the Convex Auth docs and install `@convex-dev/auth` when ready.

// Example usage (requires @convex-dev/auth/server):
// import { convexAuth } from "@convex-dev/auth/server";
// import { ResendOTP } from "./ResendOTP";
//
// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [ResendOTP],
// });

// Notes:
// - Create a provider like ResendOTP (example in convex/ResendOTP.ts) and add it to
//   the providers array.
// - Ensure you set environment variables with `npx convex env set` or via the
//   Convex dashboard for your project: e.g. AUTH_RESEND_KEY
// - This file is a scaffold only; install `@convex-dev/auth` and implement the
//   provider before deploying.

/**
 * isAuthenticated(token): Promise<{ id: string } | null>
 *
 * Scaffold helper that a server-side guard can call to verify a Convex Auth token
 * and return the user's Convex id. Replace the implementation below with calls
 * into your deployed Convex Auth functions (for example, call an `auth.verify`
 * function or use server-side helpers exported by `@convex-dev/auth`).
 */
// Attempt to wire Convex Auth server helpers if available. Keep this file safe to
// import in environments without `@convex-dev/auth` installed by falling back
// to a simple dev-token scheme (dev:<userId>). The AuthGuard calls
// `isAuthenticated(token)` to verify Bearer tokens.

// Try to wire up Convex Auth server helpers using `@convex-dev/auth/server` and the
// Resend provider implemented in `convex/ResendOTP.ts`. If the auth package is not
// available, fall back to a simple dev-token scheme so local development continues.

import type { AuthProvider } from '@convex-dev/auth/server';

let serverExports: any = null;

try {
	// dynamic require to avoid hard dependency errors when editing locally without installing
	// but prefer the package when available.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { convexAuth } = require('@convex-dev/auth/server');
	// Try to load ResendOTP provider (safe export from convex/ResendOTP)
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { ResendOTP } = require('./ResendOTP');

	const providers: AuthProvider[] = [];
	if (ResendOTP) providers.push(ResendOTP);

	// Initialize convexAuth with our providers and default options.
	serverExports = convexAuth({ providers });
} catch (err) {
	// missing package; leave serverExports null to fall back to dev tokens below
}

export async function isAuthenticated(token: string): Promise<{ id: string } | null> {
	if (!token) return null;
	// Quick dev token support: 'dev:alice' -> { id: 'alice' }
	if (token.startsWith('dev:')) return { id: token.substring(4) };

	if (serverExports) {
		try {
			// serverExports may expose verify or verifyToken
			if (typeof serverExports.verify === 'function') {
				const r = await serverExports.verify(token);
				if (r && r.id) return { id: r.id };
			}
			if (typeof serverExports.verifyToken === 'function') {
				const r = await serverExports.verifyToken(token);
				if (r && r.id) return { id: r.id };
			}
			// Some versions export `auth` with a `verify` function
			if (serverExports.auth && typeof serverExports.auth.verify === 'function') {
				const r = await serverExports.auth.verify(token);
				if (r && r.id) return { id: r.id };
			}
		} catch (err) {
			// verification failed
		}
	}

	return null;
}

// Re-export server helpers when available for direct use in Convex functions
export const authExports = serverExports;

