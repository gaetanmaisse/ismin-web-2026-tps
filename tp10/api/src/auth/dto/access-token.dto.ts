import { ApiProperty } from '@nestjs/swagger';

/** The answer to a login. Paste it in Swagger's "Authorize" to call the protected routes. */
export class AccessTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;
}
