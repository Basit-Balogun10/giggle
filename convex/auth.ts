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


export async function isAuthenticated(token: string): Promise<{ id: string } | null> {
	if (!token) return null;

	// Strict Convex-only auth: require @convex-dev/auth/server to be installed
	// and use its verification helpers. If it's not available, throw a clear
	// error so the deploy/dev environment is configured correctly.
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const convexAuthModule = require('@convex-dev/auth/server');
		// Common helper names: verifyToken or verify — try them.
		if (convexAuthModule) {
			if (typeof convexAuthModule.verifyToken === 'function') {
				const result = await convexAuthModule.verifyToken(token);
				if (result && result.id) return { id: result.id };
			}
			if (typeof convexAuthModule.verify === 'function') {
				const result = await convexAuthModule.verify(token);
				if (result && result.id) return { id: result.id };
			}
		}

		// If a Convex server-side function export is present in convex/functions/auth,
		// call it to verify tokens (some setups expose verification via functions).
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const convexFn = require('./functions/auth') as any;
		if (convexFn && typeof convexFn.verify === 'function') {
			const r = await convexFn.verify(token);
			if (r && r.id) return { id: r.id };
		}

		throw new Error('Convex Auth is installed but no verification helper returned a user id');
	} catch (err: any) {
		// Re-throw with a clearer message for maintainers.
		throw new Error(`Convex Auth verification failed: ${err?.message || String(err)}. Ensure @convex-dev/auth is installed and configured.`);
	}
}

export {};

