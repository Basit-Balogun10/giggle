import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Make the guard async so we can optionally call into Convex Auth if available.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();

    // Priority: Authorization header (Bearer token) — validate via Convex Auth.
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Require the Convex auth verifier implemented in `convex/auth.ts`.
        // This project prioritizes Convex for auth; missing Convex auth should
        // be treated as a configuration error.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const convexAuth = require('../../../convex/auth');
        if (!convexAuth || typeof convexAuth.isAuthenticated !== 'function') {
          throw new Error('convex/auth.isAuthenticated not available');
        }
        const user = await convexAuth.isAuthenticated(token);
        if (user && user.id) {
          req.user = { id: user.id };
        }
      } catch (e: any) {
        // Log a clear error; for non-public routes missing/invalid tokens will
        // cause an UnauthorizedException below.
        // eslint-disable-next-line no-console
        console.error('Convex auth verification error:', e?.message || e);
      }
    }

    // If route is public, allow it (we may have attached user info above if present)
    if (isPublic) return true;

    // For protected routes, require a user id
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Missing authentication');
    }
    return true;
  }
}
