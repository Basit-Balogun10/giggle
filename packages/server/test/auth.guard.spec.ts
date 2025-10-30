import { describe, it, expect } from 'vitest';
import { AuthGuard } from '../src/auth.guard';

// Minimal mock ExecutionContext for Nest guard testing
function mockExecutionContext(req: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('AuthGuard', () => {
  it('accepts dev bearer token and sets req.user', async () => {
    const mockReflector = { getAllAndOverride: () => undefined } as any;
    const guard = new AuthGuard(mockReflector);
    const req: any = { headers: { authorization: 'Bearer dev:tester' } };
    const ctx = mockExecutionContext(req);
    const ok = await guard.canActivate(ctx as any);
    expect(ok).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('tester');
  });

  it('falls back to x-user-id header when no token', async () => {
    const mockReflector = { getAllAndOverride: () => undefined } as any;
    const guard = new AuthGuard(mockReflector);
    const req: any = { headers: { 'x-user-id': 'header-user' } };
    const ctx = mockExecutionContext(req);
    const ok = await guard.canActivate(ctx as any);
    expect(ok).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('header-user');
  });
});
