import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is not set: cp .env.example .env');

/**
 * Given. Signs and verifies tokens with the secret from `.env`.
 *
 * `global: true` makes JwtService injectable everywhere, so `AuthGuard` works
 * in any module without importing anything.
 */
@Module({
  imports: [JwtModule.register({ global: true, secret, signOptions: { expiresIn: '1h' } })],
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
