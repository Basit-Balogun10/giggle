Paystack webhook notes

Important security note: Paystack signs webhooks using HMAC SHA512 of the raw request body with your secret.

To validate webhooks in an Express / Nest app you should:

1. Capture the raw body. In Nest with Express you can configure a body-parser option:

```ts
// main.ts example
import * as express from 'express';
import { json } from 'body-parser';

const server = express();
server.use(json({ verify: (req: any, res, buf) => { req.rawBody = buf.toString(); } }));
```

2. Compute HMAC:

```ts
const signature = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET!).update(req.rawBody).digest('hex');
if (signature !== req.headers['x-paystack-signature']) {
  return res.status(400).send('invalid signature');
}
```

3. Process events for `charge.success`, `transfer.success`, etc. Update DB and release escrow atomically.

This file is a reminder and reference. The scaffold `server/src/paystack.controller.ts` contains a placeholder route, but currently does not capture raw body; follow the examples above when wiring into production.
