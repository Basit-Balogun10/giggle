/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as auth from "../auth.js";
import type * as functions_auth from "../functions/auth.js";
import type * as functions_bids from "../functions/bids.js";
import type * as functions_charges from "../functions/charges.js";
import type * as functions_claims from "../functions/claims.js";
import type * as functions_gigs from "../functions/gigs.js";
import type * as functions_ledger from "../functions/ledger.js";
import type * as http from "../http.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  auth: typeof auth;
  "functions/auth": typeof functions_auth;
  "functions/bids": typeof functions_bids;
  "functions/charges": typeof functions_charges;
  "functions/claims": typeof functions_claims;
  "functions/gigs": typeof functions_gigs;
  "functions/ledger": typeof functions_ledger;
  http: typeof http;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
