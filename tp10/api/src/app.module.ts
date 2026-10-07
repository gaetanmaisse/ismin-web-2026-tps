import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health/health.controller.js';
import { ModelsModule } from './models/models.module.js';
import { OrganisationsModule } from './organisations/organisations.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

/**
 * GET /health answers 200 as soon as the application runs: Docker and
 * compose can use it to know when the API is up.
 */
@Module({
  imports: [PrismaModule, OrganisationsModule, ModelsModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
