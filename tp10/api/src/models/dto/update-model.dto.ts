import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { type Task, TASKS } from '../model.js';

/** Given. A partial update: every field is optional, `id`, `org` and `downloads` cannot change. */
export class UpdateModelDto {
  @ApiPropertyOptional({ example: 'Mistral-7B-Instruct-v0.3' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ enum: TASKS, enumName: 'Task' })
  @IsOptional()
  @IsIn(TASKS)
  task?: Task;

  @ApiPropertyOptional({ description: 'In billions', minimum: 0, example: 7.25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  parameters?: number;

  @ApiPropertyOptional({ example: 'apache-2.0' })
  @IsOptional()
  @IsString()
  license?: string;
}
