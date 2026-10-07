import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '../users.js';

/** What the token carries. `sub` is the user id: that is the JWT convention. */
export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
}

/** The request, once the guard has run: `user` is filled from the token. */
export interface AuthenticatedRequest {
  headers: { authorization?: string };
  user?: JwtPayload;
}

/**
 * Given. Runs before the handler of every route it is applied to:
 * reads the Bearer token, verifies it, and attaches the payload to the request.
 * No token, or a bad one: 401, and the handler never runs.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException('Missing bearer token');
    console.log('AuthGuard token:', token);

    try {
      request.user = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }
}

function extractBearerToken(header: string | undefined): string | undefined {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme === 'Bearer' ? token : undefined;
}
