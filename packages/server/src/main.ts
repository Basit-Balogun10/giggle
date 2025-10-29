import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Capture raw body for Paystack webhook route and also parse JSON for Nest
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  const rawParser = express.raw({ type: 'application/json' });
  expressApp.use('/api/paystack/webhook', (req: Request & { rawBody?: Buffer }, res: Response, next: NextFunction) => {
    rawParser(req as Request, res as Response, (err: unknown) => {
      if (err) return next(err as Error);
      try {
        // Save a copy of raw bytes (rawParser sets req.body to a Buffer)
        if (Buffer.isBuffer((req as any).body)) {
          req.rawBody = (req as any).body as Buffer;
          // Parse JSON so Nest's @Body() works as usual
          req.body = JSON.parse((req as any).body.toString('utf8')) as unknown as Record<string, unknown>;
        }
      } catch (e) {
        // ignore parse errors — controller should handle invalid payloads
      }
      next();
    });
  });

  app.setGlobalPrefix('api');
  await app.listen(3333);
  console.log('Server listening on http://localhost:3333');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap server', err);
  process.exit(1);
});
