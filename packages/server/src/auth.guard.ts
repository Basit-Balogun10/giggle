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

    // Priority 1: Authorization header (Bearer token) — attempt to validate via
    // Convex Auth if the project has it wired. This is a best-effort dynamic require
    // so tests and local dev without Convex keep working.
    try {
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
          // Dev token shortcut: 'dev:<userId>' — avoid requiring Convex packages in tests
          if (typeof token === 'string' && token.startsWith('dev:')) {
            req.user = { id: token.substring(4) };
          } else {
            try {
              // Attempt to call a Convex-auth provided verifier if present. The file
              // `convex/auth.ts` should export `isAuthenticated` when Convex Auth is
              // configured. This is a non-breaking, optional integration.
              // Path is relative to packages/server/src -> ../../../convex/auth
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const convexAuth = require('../../../convex/auth');
              if (convexAuth && typeof convexAuth.isAuthenticated === 'function') {
                const user = await convexAuth.isAuthenticated(token);
                if (user && user.id) {
                  req.user = { id: user.id };
                }
              }
            } catch (e) {
              // No convex auth present or call failed — continue to other fallbacks.
            }
          }
      }
    } catch (e) {
      // Ignore errors while attempting Convex auth integration
    }

    // Fallback: dev header `x-user-id` for quick local auth during development
    const headerUser = req.headers?.['x-user-id'];
    if (headerUser && !req.user) {
      req.user = { id: headerUser };
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
