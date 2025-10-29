import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Test as NestTest } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Gigs (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
  // Provide a minimal ConvexService mock so the controller used in tests has createGig
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

  const moduleRef = await NestTest.createTestingModule({
    controllers: [ (await import('../src/gigs.controller')).GigsController ],
    providers: [ { provide: (await import('../src/convex.service')).ConvexService, useValue: mockConvex } ],
  }).compile();

    app = moduleRef.createNestApplication();
    // Ensure test app uses same global prefix as runtime bootstrap
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/gigs creates a gig (stub)', async () => {
    const payload = { title: 'Integration Test Gig', payout: 100 };
    const res = await request(app.getHttpServer()).post('/api/gigs').send(payload).set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(payload.title);
  });
});
