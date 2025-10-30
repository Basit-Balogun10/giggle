Convex functions for Giggle
==========================

This folder contains scaffolded Convex server function implementations for the bidding
and ledger workflows used by Giggle. These are example stubs and pseudocode to help
you implement production Convex functions.

Notes:
- Install the Convex CLI / SDK and deploy these functions to your Convex project.
- Use Convex transactions for critical multi-step actions (accepting a bid should
  update the bid status, create ledger entries, and record a charge in a single
  atomic transaction).
- The sample code below uses the `convex/functions` import names — verify your
  Convex SDK version and adjust imports accordingly.

See `bids.ts` and `ledger.ts` for function examples.
