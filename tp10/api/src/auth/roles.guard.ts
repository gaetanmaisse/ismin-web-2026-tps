import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../users.js';
import type { AuthenticatedRequest } from './auth.guard.js';
import { ROLES_KEY } from './roles.decorator.js';

/**
 * step 4. Runs after AuthGuard, which must have filled
 * `request.user`. No @Roles() on the route: everyone logged in may pass.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException(`Requires one of the roles: ${required.join(', ')}`);
    }
    return true;
  }
}
