import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Test as NestTest } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

describe('Claims (integration)', () => {
  // This test can be slow when running in the full suite; give it extra time.
  it('Claims controller is wired and returns a pending mock charge', async () => {
    const mockClaims = {
      createCharge: async (amount: number, metadata?: any) => ({
        reference: `ps_test_${Date.now()}`,
        amount,
        status: 'pending',
        metadata: metadata ?? {},
      }),
    };

    const { ClaimsController } = await import('../src/claims.controller');
    const { ClaimsService } = await import('../src/claims.service');

    const builder = NestTest.createTestingModule({
      controllers: [ClaimsController],
      // register the provider under the same string token the controller expects
      providers: [{ provide: 'ClaimsService', useClass: ClaimsService } as any],
    });

    // Override provider token (string) used in AppModule and ClaimsController
    builder.overrideProvider('ClaimsService').useValue(mockClaims as any);

    const moduleRef = await builder.compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const payload = { gigId: 'g1', userId: 'u1', amount: 750 };
    const res = await request(app.getHttpServer()).post('/api/claims').send(payload).set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('reference');
    expect(res.body.status).toBe('pending');
    expect(res.body.amount).toBe(750);
    await app.close();
  });
});