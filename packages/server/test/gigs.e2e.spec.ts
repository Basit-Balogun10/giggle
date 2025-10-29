import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('GigsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Provide a safe mock for ConvexService during e2e to ensure controller has a working
    // createGig method (avoids DI edge cases in test harness).
    const mockConvex = {
      createGig: async (payload: any) => ({
        id: `local-test-${Date.now()}`,
        title: payload.title,
        description: payload.description ?? '',
        payout: payload.payout ?? 0,
        location: payload.location ?? 'unknown',
        createdAt: new Date().toISOString(),
        authorId: 'test',
      }),
    };

    // Create a focused testing module with the controller and a mocked ConvexService
    const moduleRef = await Test.createTestingModule({
      controllers: [ (await import('../src/gigs.controller')).GigsController ],
      providers: [ { provide: (await import('../src/convex.service')).ConvexService, useValue: mockConvex } ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('POST /api/gigs creates a gig (returns stub when Convex not configured)', async () => {
    const payload = {
      title: 'E2E Test Gig',
      description: 'Created by e2e test',
      payout: 1000,
      location: 'Test'
    };

  const res = await supertest(app.getHttpServer()).post('/api/gigs').send(payload).set('Accept', 'application/json');
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(payload.title);
  });
});
