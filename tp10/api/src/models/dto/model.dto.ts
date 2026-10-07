import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Model, type Task, TASKS } from '../model.js';

/**
 * A model, the way the API answers it. `Model` is an interface, erased at
 * compile time: Swagger needs a class to read at runtime. `implements Model`
 * keeps both in step.
 */
export class ModelDto implements Model {
  @ApiProperty({ example: 'mistral-7b-instruct-v0-3' })
  id!: string;

  @ApiProperty({ example: 'Mistral-7B-Instruct-v0.3' })
  name!: string;

  @ApiProperty({ description: 'Slug of the organisation', example: 'mistralai' })
  org!: string;

  @ApiProperty({ enum: TASKS, enumName: 'Task' })
  task!: Task;

  @ApiProperty({ description: 'In billions', example: 7.25 })
  parameters!: number;

  @ApiProperty({ example: 1420000 })
  downloads!: number;

  @ApiPropertyOptional({ example: 'apache-2.0' })
  license?: string;

  @ApiPropertyOptional({ description: 'Username of who created it', example: 'alice' })
  createdBy?: string;
}
