import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { isAuthenticated } from '../../../convex/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Make the guard async so we can optionally call into Convex Auth if available.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
      import { Reflector } from '@nestjs/core';
      import { IS_PUBLIC_KEY } from './public.decorator';
      import { isAuthenticated } from '../../../convex/auth';

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

          try {
            const authHeader = req.headers?.authorization || req.headers?.Authorization;
            if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
              const token = authHeader.split(' ')[1];
              // Dev token shortcut: 'dev:<userId>' — avoid requiring Convex packages in tests
              if (typeof token === 'string' && token.startsWith('dev:')) {
                req.user = { id: token.substring(4) };
              } else {
                try {
                  if (typeof token === 'string') {
                    const authUser = await isAuthenticated(token);
                    if (authUser && authUser.id) {
                      req.user = { id: authUser.id };
                    }
                  }
                } catch (e) {
                  // No convex auth present or call failed — continue to other fallbacks.
                }
              }
            }
          } catch (err) {
            // If header parsing fails, continue — the protected route check below will enforce auth.
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

    // For protected routes, require a user id
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException("Missing authentication");
    }
    return true;
  }
}
