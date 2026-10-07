import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Task, TASKS } from '../model.js';

/**
 * Given. `downloads` is not here on purpose: a download count is measured
 * by the system, never posted by a client.
 *
 * These decorators run at runtime, unlike TypeScript types which are erased
 * at compile time. This is what actually protects the service from whatever
 * arrives over the network.
 */
export class CreateModelDto {
  @ApiProperty({ example: 'mistral-7b-instruct-v0-3' })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'id must be a lowercase slug, e.g. "mistral-7b-instruct-v0-3"',
  })
  id!: string;

  @ApiProperty({ example: 'Mistral-7B-Instruct-v0.3' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Slug of an existing organisation', example: 'mistralai' })
  @IsString()
  @IsNotEmpty()
  org!: string;

  @ApiProperty({ enum: TASKS, enumName: 'Task' })
  @IsIn(TASKS)
  task!: Task;

  @ApiProperty({ description: 'In billions', minimum: 0, example: 7.25 })
  @IsNumber()
  @Min(0)
  // @Max(2_000) // TODO: which maximum? Llama 405B, and the next ones?
  parameters!: number;

  @ApiPropertyOptional({ example: 'apache-2.0' })
  @IsOptional()
  @IsString()
  license?: string;
}
