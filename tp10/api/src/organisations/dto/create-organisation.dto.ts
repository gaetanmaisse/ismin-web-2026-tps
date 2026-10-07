import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganisationDto {
  @ApiProperty({ example: 'mistralai' })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'slug must be a lowercase slug, e.g. "mistralai"' })
  slug!: string;

  @ApiProperty({ example: 'Mistral AI' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2', example: 'FR' })
  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'country must be an ISO 3166-1 alpha-2 code, e.g. "FR"' })
  country?: string;
}
