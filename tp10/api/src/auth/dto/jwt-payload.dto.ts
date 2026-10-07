import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '../../users.js';
import type { JwtPayload } from '../auth.guard.js';

/** What the token carries, the way `GET /auth/whoami` answers it. */
export class JwtPayloadDto implements JwtPayload {
  @ApiProperty({ description: 'User id', example: 'u1' })
  sub!: string;

  @ApiProperty({ example: 'alice' })
  username!: string;

  @ApiProperty({ enum: ['admin', 'user'], example: 'admin' })
  role!: Role;
}
