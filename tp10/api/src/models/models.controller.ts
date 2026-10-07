import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthGuard, type JwtPayload } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { CreateModelDto } from './dto/create-model.dto.js';
import { ModelDto } from './dto/model.dto.js';
import { UpdateModelDto } from './dto/update-model.dto.js';
import { ModelAlreadyExists, UnknownOrganisation, TASKS, type Model, type Task } from './model.js';
import { ModelsService } from './models.service.js';

/**
 * Reading is public, writing needs a token, deleting needs the
 * admin role, and the creator is stamped on the model.
 */
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  @ApiQuery({ name: 'org', required: false, example: 'mistralai' })
  @ApiQuery({ name: 'task', required: false, enum: TASKS, enumName: 'Task' })
  @ApiOkResponse({ type: [ModelDto] })
  findAll(@Query('org') org?: string, @Query('task') task?: Task): Promise<Model[]> {
    return this.modelsService.findAll({ org, task });
  }

  @Get(':id')
  @ApiOkResponse({ type: ModelDto })
  @ApiNotFoundResponse({ description: 'Unknown model' })
  async findOne(@Param('id') id: string): Promise<Model> {
    const model = await this.modelsService.findOne(id);

    if (!model) {
      throw new NotFoundException(`Model ${id} not found`);
    }
    return model;
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ModelDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiConflictResponse({ description: 'A model with this id already exists' })
  @ApiUnprocessableEntityResponse({ description: 'Unknown organisation: create it first' })
  async create(@Body() dto: CreateModelDto, @CurrentUser() user: JwtPayload): Promise<Model> {
    try {
      return await this.modelsService.create(dto, user.username);
    } catch (error) {
      if (error instanceof UnknownOrganisation) throw new UnprocessableEntityException(error.message);
      if (error instanceof ModelAlreadyExists) throw new ConflictException(error.message);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ModelDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Unknown model' })
  async update(@Param('id') id: string, @Body() dto: UpdateModelDto): Promise<Model> {
    const model = await this.modelsService.update(id, dto);

    if (!model) {
      throw new NotFoundException(`Model ${id} not found`);
    }
    return model;
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'Unknown model' })
  async remove(@Param('id') id: string): Promise<void> {
    if (!(await this.modelsService.remove(id))) {
      throw new NotFoundException(`Model ${id} not found`);
    }
  }
}
