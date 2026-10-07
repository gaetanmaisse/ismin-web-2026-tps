import { Body, ConflictException, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { CreateOrganisationDto } from './dto/create-organisation.dto.js';
import { Organisation, OrganisationAlreadyExists } from './organisation.js';
import { OrganisationsService } from './organisations.service.js';

/**
 * TP4 solution: creating an organisation is for admins, step 4.
 */
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get()
  findAll(): Promise<Organisation[]> {
    return this.organisationsService.findAll();
  }

  @Post()
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  async create(@Body() dto: CreateOrganisationDto): Promise<Organisation> {
    try {
      return await this.organisationsService.create(dto);
    } catch (error) {
      if (error instanceof OrganisationAlreadyExists) throw new ConflictException(error.message);
      throw error;
    }
  }
}
