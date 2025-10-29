import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ConvexService } from '../src/convex.service';
import { GigsController } from '../src/gigs.controller';

describe('DI Sanity', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Match runtime prefix
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('ConvexService should be provided by DI', async () => {
    const moduleRef = (app as any).getHttpServer ? (app as any)._testingModule : null;
    // fall back to using Test.createTestingModule approach to get a module reference
    // but we can also retrieve via app.get
    const convex = app.get(ConvexService, { strict: false });
    expect(convex).toBeDefined();
  });

  it('GigsController should be provided by DI', async () => {
    const gigs = app.get(GigsController, { strict: false });
    expect(gigs).toBeDefined();
  });
});
