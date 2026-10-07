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
import { AuthGuard, type JwtPayload } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { CreateModelDto } from './dto/create-model.dto.js';
import { UpdateModelDto } from './dto/update-model.dto.js';
import { ModelAlreadyExists, UnknownOrganisation, type Model, type Task } from './model.js';
import { ModelsService } from './models.service.js';

/**
 * TP4 solution. Reading is public, writing needs a token, deleting needs the
 * admin role, and the creator is stamped on the model.
 */
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  findAll(@Query('org') org?: string, @Query('task') task?: Task): Promise<Model[]> {
    return this.modelsService.findAll({ org, task });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Model> {
    const model = await this.modelsService.findOne(id);

    if (!model) {
      throw new NotFoundException(`Model ${id} not found`);
    }
    return model;
  }

  @Post()
  @UseGuards(AuthGuard)
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
  async remove(@Param('id') id: string): Promise<void> {
    if (!(await this.modelsService.remove(id))) {
      throw new NotFoundException(`Model ${id} not found`);
    }
  }
}
