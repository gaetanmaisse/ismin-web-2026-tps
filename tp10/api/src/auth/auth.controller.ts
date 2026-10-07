import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { findUser } from '../users.js';
import { AuthGuard, type AuthenticatedRequest, type JwtPayload } from './auth.guard.js';
import { AccessTokenDto } from './dto/access-token.dto.js';
import { JwtPayloadDto } from './dto/jwt-payload.dto.js';
import { LoginDto } from './dto/login.dto.js';
// import { RefreshDto } from './dto/refresh.dto.js';
import { verifyPassword } from './password.js';

/**
 * Given.
 *   POST /auth/login   { username, password }  →  { access_token }, or 401
 *   GET  /auth/whoami  with a Bearer token      →  the token's payload, or 401
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: AccessTokenDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiUnauthorizedResponse({ description: 'Wrong username or password' })
  async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    const user = findUser(dto.username);
    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Wrong username or password');
    }

    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
    return { access_token: await this.jwt.signAsync(payload) };
  }

  // TODO: refresh tokens, the access token only lives one hour
  // @Post('refresh')
  // @HttpCode(200)
  // async refresh(@Body() dto: RefreshDto): Promise<{ access_token: string }> {
  //   const payload = await this.jwt.verifyAsync<JwtPayload>(dto.refresh_token, {
  //     secret: process.env.JWT_REFRESH_SECRET,
  //   });
  //   return { access_token: await this.jwt.signAsync({ sub: payload.sub, username: payload.username, role: payload.role }) };
  // }

  @Get('whoami')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: JwtPayloadDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  whoami(@Req() request: AuthenticatedRequest): JwtPayload | undefined {
    return request.user;   // card 6 replaces this @Req() with a decorator of your own
  }
}
