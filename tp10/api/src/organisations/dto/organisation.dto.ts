import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Organisation } from '../organisation.js';

/** An organisation, the way the API answers it: a class, so Swagger can read it. */
export class OrganisationDto implements Organisation {
  @ApiProperty({ example: 'mistralai' })
  slug!: string;

  @ApiProperty({ example: 'Mistral AI' })
  name!: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2', example: 'FR' })
  country?: string;
}
