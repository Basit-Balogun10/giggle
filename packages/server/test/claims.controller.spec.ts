import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ClaimsController } from '../src/claims.controller';
import { ClaimsService } from '../src/claims.service';

describe('ClaimsController', () => {
  let app: INestApplication;

  it('ClaimsController.create returns a pending mock charge', async () => {
    const mockClaims = { createCharge: async (a: number, m?: any) => ({ reference: 'ps_test_1', amount: a, status: 'pending', metadata: m }) };
    const controller = new ClaimsController(mockClaims as unknown as ClaimsService);
    const payload = { gigId: 'g1', userId: 'u1', amount: 500 } as any;
    const res = await controller.create(payload);
    expect(res).toHaveProperty('reference');
    expect(res.status).toBe('pending');
    expect(res.amount).toBe(500);
  });
});
