import { Body, ConflictException, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { CreateOrganisationDto } from './dto/create-organisation.dto.js';
import { OrganisationDto } from './dto/organisation.dto.js';
import { Organisation, OrganisationAlreadyExists } from './organisation.js';
import { OrganisationsService } from './organisations.service.js';

/**
 * creating an organisation is for admins, step 4.
 */
@Controller('organisations')
export class OrganisationsController {
  constructor(private readonly organisationsService: OrganisationsService) {}

  @Get()
  @ApiOkResponse({ type: [OrganisationDto] })
  findAll(): Promise<Organisation[]> {
    return this.organisationsService.findAll();
  }

  @Post()
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OrganisationDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiConflictResponse({ description: 'An organisation with this slug already exists' })
  async create(@Body() dto: CreateOrganisationDto): Promise<Organisation> {
    try {
      return await this.organisationsService.create(dto);
    } catch (error) {
      if (error instanceof OrganisationAlreadyExists) throw new ConflictException(error.message);
      throw error;
    }
  }
}
