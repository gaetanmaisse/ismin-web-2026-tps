import { Module } from '@nestjs/common';
import { OrganisationsController } from './organisations.controller.js';
import { OrganisationsService } from './organisations.service.js';

@Module({
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
